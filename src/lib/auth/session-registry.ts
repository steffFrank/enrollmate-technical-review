/*
 * IncluDO AI Platform
 * Copyright (c) 2026 Steff (steffFrank). All rights reserved.
 */
import "server-only";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getSessionIdFromAccessToken, hashToken } from "@/lib/utils/jwt";
import { UnauthorizedError } from "@/lib/errors/http-errors";

export type SessionRecord = {
  id: string;
  userId: string;
  sessionId: string | null;
  status: "active" | "revoked" | "expired";
  lastValidatedAt: string | null;
};

export type SessionResolution =
  | { status: "found"; record: SessionRecord }
  | { status: "repaired"; record: SessionRecord }
  | { status: "missing" }
  | { status: "revoked" }
  | { status: "error"; error: Error };

type ResolveParams = {
  adminClient?: SupabaseClient;
  userId: string;
  accessToken: string;
  userAgent?: string | null;
  ipAddress?: string | null;
  allowRepair?: boolean;
};

/** Resolves, creates, or repairs a user session record in the DB registry. */
export async function resolveSessionRecord({
  adminClient,
  userId,
  accessToken,
  userAgent,
  ipAddress,
  allowRepair = false,
}: ResolveParams): Promise<SessionResolution> {
  const db = adminClient ?? getSupabaseAdmin();
  const sessionId = getSessionIdFromAccessToken(accessToken);
  const tokenHash = await hashToken(accessToken);

  try {
    // Lookup by session_id (primary) or access_token_hash (fallback).
    let query = db
      .from("user_sessions")
      .select("id, user_id, session_id, status, last_validated_at")
      .eq("user_id", userId);

    if (sessionId) {
      query = query.eq("session_id", sessionId);
    } else {
      query = query.eq("access_token_hash", tokenHash);
    }

    const { data: rows, error } = await query.order("created_at", { ascending: false }).limit(1);

    if (error) {
      console.error("[session-registry] lookup error:", error.message);
      return { status: "error", error: new Error(error.message) };
    }

    const row = rows?.[0];

    if (row) {
      if (row.status === "revoked") return { status: "revoked" };
      if (row.status === "expired") return { status: "missing" };

      // Active — update last_validated_at (best-effort, non-blocking).
      db.from("user_sessions")
        .update({ last_validated_at: new Date().toISOString() })
        .eq("id", row.id)
        .then(() => {});

      const record: SessionRecord = {
        id: row.id,
        userId: row.user_id,
        sessionId: row.session_id,
        status: "active",
        lastValidatedAt: row.last_validated_at,
      };
      return { status: "found", record };
    }

    // Not found.
    if (!allowRepair) return { status: "missing" };

    // Repair: create a new session record for a user who signed in before the registry existed.
    const { data: newRow, error: insertError } = await db
      .from("user_sessions")
      .insert({
        user_id: userId,
        session_id: sessionId,
        access_token_hash: tokenHash,
        user_agent: userAgent ?? null,
        ip_address: ipAddress ?? null,
        status: "active",
        last_validated_at: new Date().toISOString(),
      })
      .select("id, user_id, session_id, status, last_validated_at")
      .single();

    if (insertError || !newRow) {
      console.error("[session-registry] repair insert error:", insertError?.message);
      return { status: "error", error: new Error(insertError?.message ?? "Insert failed") };
    }

    return {
      status: "repaired",
      record: {
        id: newRow.id,
        userId: newRow.user_id,
        sessionId: newRow.session_id,
        status: "active",
        lastValidatedAt: newRow.last_validated_at,
      },
    };
  } catch (err) {
    return { status: "error", error: err instanceof Error ? err : new Error("Unknown error") };
  }
}

/** Creates a session record immediately after sign-in. */
export async function registerSession(params: {
  user: User;
  accessToken: string;
  userAgent?: string | null;
  ipAddress?: string | null;
}): Promise<void> {
  const db = getSupabaseAdmin();
  const sessionId = getSessionIdFromAccessToken(params.accessToken);
  const tokenHash = await hashToken(params.accessToken);

  await db.from("user_sessions").upsert(
    {
      user_id: params.user.id,
      session_id: sessionId,
      access_token_hash: tokenHash,
      user_agent: params.userAgent ?? null,
      ip_address: params.ipAddress ?? null,
      status: "active",
      last_validated_at: new Date().toISOString(),
    },
    { onConflict: "session_id", ignoreDuplicates: false },
  );
}

/** Revokes a session by session_id or token hash. Used on explicit logout. */
export async function revokeSession(params: {
  userId: string;
  accessToken: string;
}): Promise<void> {
  const db = getSupabaseAdmin();
  const sessionId = getSessionIdFromAccessToken(params.accessToken);
  const tokenHash = await hashToken(params.accessToken);

  const query = db
    .from("user_sessions")
    .update({ status: "revoked", revoked_at: new Date().toISOString() })
    .eq("user_id", params.userId);

  if (sessionId) {
    await query.eq("session_id", sessionId);
  } else {
    await query.eq("access_token_hash", tokenHash);
  }
}

/** Revokes ALL active sessions for a user (forced logout from all devices). */
export async function revokeAllUserSessions(userId: string): Promise<void> {
  const db = getSupabaseAdmin();
  await db
    .from("user_sessions")
    .update({ status: "revoked", revoked_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("status", "active");
}

/** Verifies a fresh session, throwing UnauthorizedError if invalid/revoked. */
export async function ensureFreshSession(
  supabase: SupabaseClient,
  user: User | null,
): Promise<void> {
  if (!user) throw new UnauthorizedError();

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !sessionData.session?.access_token) throw new UnauthorizedError();

  const accessToken = sessionData.session.access_token;
  const sessionId = getSessionIdFromAccessToken(accessToken);
  const cacheKey = `${user.id}:${sessionId ?? (await hashToken(accessToken)).slice(0, 40)}`;

  // Fast path: skip the DB round-trip if validated recently.
  const { hasRecentSessionValidation, rememberSessionValidation } = await import(
    "@/lib/auth/session-cache"
  );
  if (hasRecentSessionValidation(cacheKey)) return;

  let userAgent: string | null = null;
  let ipAddress: string | null = null;
  try {
    const { headers } = await import("next/headers");
    const h = await headers();
    userAgent = h.get("user-agent");
    ipAddress = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip");
  } catch {
    // Headers not available in all contexts; continue without them.
  }

  const resolution = await resolveSessionRecord({
    userId: user.id,
    accessToken,
    userAgent,
    ipAddress,
    allowRepair: true,
  });

  if (resolution.status === "error") throw new UnauthorizedError();
  if (resolution.status === "missing" || resolution.status === "revoked") throw new UnauthorizedError();

  rememberSessionValidation(cacheKey);
}
