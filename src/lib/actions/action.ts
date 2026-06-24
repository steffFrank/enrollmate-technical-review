/*
 * IncluDO AI Platform
 * Copyright (c) 2026 Steff (steffFrank). All rights reserved.
 *
 * Shared server-side helper for actions and route handlers. NOT a "use server"
 * module: it is imported by actual server actions (which are "use server") and
 * by route handlers. Keeping it server-only avoids exposing it as an RPC endpoint.
 */
import "server-only";
import { ZodError, type ZodTypeAny, type z } from "zod";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import {
  DatabaseError,
  ForbiddenError,
  ServerError,
  UnauthorizedError,
  ValidationError,
} from "@/lib/errors/http-errors";
import { handleError, type ErrorPayload } from "@/lib/errors/handle-error";
import { getContextAwareClient, type ClientContext } from "@/lib/supabase/context-client";
import { getServerUser } from "@/lib/auth/get-server-user";
import { ensureFreshSession } from "@/lib/auth/session-registry";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { Role, PLATFORM_ROLES, ORG_READ_ROLES } from "@/constants/roleAccessControl";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ActionOptions<S extends ZodTypeAny> = {
  /** Raw input to validate against the schema (Zod input type — defaults optional). */
  params: z.input<S>;
  schema: S;
  /** Require an authenticated session. Defaults to true. */
  authorize?: boolean;
  /**
   * One or more roles the caller must hold.
   * - PLATFORM_ADMIN: checked against auth.users.app_metadata.platform_role
   * - ORG_ADMIN / ORG_MEMBER: checked against org_memberships (requires organizationId)
   */
  requiredRole?: Role | Role[];
  /** Required when requiredRole includes an org-scoped role. */
  organizationId?: string;
  /** Re-validate the session against the DB registry (prevents stale cookie replays). */
  requireFreshSession?: boolean;
};

export type ActionSuccessData<T> = {
  user: User | null;
  params: T;
  supabase: SupabaseClient;
  metadata: {
    executionId: string;
    timestamp: Date;
    context: ClientContext;
  };
};

export type ActionResult<T> =
  | { success: true; data: ActionSuccessData<T> }
  | { success: false; error: ErrorPayload };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateExecutionId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

/** Returns true when the user holds the platform_admin role in app_metadata. */
function isPlatformAdmin(user: User): boolean {
  return (user.app_metadata as Record<string, unknown>)?.platform_role === "platform_admin";
}

/** Checks org-scoped role via the org_memberships table. */
async function checkOrgRole(params: {
  userId: string;
  organizationId: string;
  allowedRoles: Role[];
}): Promise<boolean> {
  const db = getSupabaseAdmin();
  const { data } = await db
    .from("org_memberships")
    .select("role")
    .eq("user_id", params.userId)
    .eq("organization_id", params.organizationId)
    .maybeSingle();

  if (!data?.role) return false;

  // ORG_ADMIN implicitly satisfies ORG_MEMBER requirements (hierarchy).
  if (params.allowedRoles.includes(Role.ORG_MEMBER)) {
    return ORG_READ_ROLES.includes(data.role as Role);
  }

  return params.allowedRoles.includes(data.role as Role);
}

async function enforceRole(
  user: User,
  requiredRole: Role | Role[],
  organizationId?: string,
): Promise<void> {
  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

  // Platform admins bypass all org-level role checks.
  const needsPlatform = roles.some((r) => PLATFORM_ROLES.includes(r));
  if (needsPlatform) {
    if (!isPlatformAdmin(user)) throw new ForbiddenError();
    return;
  }

  // Org-scoped roles.
  const orgRoles = roles.filter((r) => ORG_READ_ROLES.includes(r));
  if (orgRoles.length > 0) {
    if (!organizationId) {
      throw new ServerError("organizationId is required for org-scoped role checks.");
    }

    // Platform admins always pass org checks too.
    if (isPlatformAdmin(user)) return;

    const allowed = await checkOrgRole({
      userId: user.id,
      organizationId,
      allowedRoles: orgRoles,
    });
    if (!allowed) throw new ForbiddenError();
  }
}

// ---------------------------------------------------------------------------
// Main action() helper
// ---------------------------------------------------------------------------

export async function action<S extends ZodTypeAny>({
  params,
  schema,
  authorize = true,
  requiredRole,
  organizationId,
  requireFreshSession = false,
}: ActionOptions<S>): Promise<ActionResult<z.output<S>>> {
  const executionId = generateExecutionId();

  try {
    const { supabase, context } = await getContextAwareClient();
    let user: User | null = null;

    // Step 1: Validate input.
    const validatedParams = schema.parse(params) as z.output<S>;

    // Step 2: Authenticate.
    if (authorize) {
      const authUser = await getServerUser();
      if (!authUser) throw new UnauthorizedError();
      user = authUser;

      // Step 3: Role check.
      if (requiredRole) {
        await enforceRole(user, requiredRole, organizationId);
      }

      // Step 4: Fresh session check (DB round-trip, cached per TTL).
      if (requireFreshSession) {
        await ensureFreshSession(supabase, user);
      }
    }

    return {
      success: true,
      data: {
        user,
        params: validatedParams,
        supabase,
        metadata: { executionId, timestamp: new Date(), context },
      },
    };
  } catch (error) {
    if (error instanceof ZodError) {
      const ve = new ValidationError({ issues: error.errors.map((e) => e.message) });
      return { success: false, error: handleError(ve) };
    }

    if (
      error instanceof UnauthorizedError ||
      error instanceof ForbiddenError ||
      error instanceof ValidationError ||
      error instanceof DatabaseError ||
      error instanceof ServerError
    ) {
      return { success: false, error: handleError(error) };
    }

    console.error("[action] unexpected error:", error);
    return { success: false, error: handleError(new ServerError()) };
  }
}
