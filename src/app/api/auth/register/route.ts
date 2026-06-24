/*
 * IncluDO AI Platform
 * Copyright (c) 2026 Steff (steffFrank). All rights reserved.
 */
import { type NextRequest } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isPasswordPolicySatisfied, PASSWORD_POLICY_MESSAGE } from "@/lib/auth/password-policy";
import { registerSession } from "@/lib/auth/session-registry";
import { isSelfServiceSignupEnabled } from "@/lib/auth/self-service";
import { getAuthSiteUrl } from "@/lib/auth/site-url";
import { validateCaptchaToken } from "@/lib/auth/turnstile";
import { getClientIp } from "@/lib/rate-limit";
import { jsonError, jsonOk } from "@/lib/http";

export const runtime = "nodejs";

const registerSchema = z.object({
  fullName: z.string().trim().max(120).optional(),
  email: z.string().email(),
  password: z.string().refine(isPasswordPolicySatisfied, { message: PASSWORD_POLICY_MESSAGE }),
  privacyAccepted: z.literal(true),
  captchaToken: z.string().optional(),
});

export async function POST(request: NextRequest) {
  if (!isSelfServiceSignupEnabled()) {
    return jsonError("Self-service signup is not available.", 403);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body.", 400);
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Validation failed.", 422, { issues: parsed.error.flatten().fieldErrors });
  }

  const captchaToken = validateCaptchaToken(parsed.data.captchaToken);
  if (captchaToken && typeof captchaToken !== "string") {
    return jsonError(captchaToken.error, 400);
  }

  const supabase = await createSupabaseServerClient();
  const siteUrl = await getAuthSiteUrl(request.headers);
  const { fullName, email, password } = parsed.data;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName || null },
      emailRedirectTo: `${siteUrl}/auth/callback?next=/onboarding`,
      ...(captchaToken ? { captchaToken } : {}),
    },
  });

  if (error) return jsonError("Could not create the account.", 400);
  if (!data.user) return jsonError("Could not create the account.", 500);

  if (data.session) {
    await registerSession({
      user: data.session.user,
      accessToken: data.session.access_token,
      userAgent: request.headers.get("user-agent"),
      ipAddress: getClientIp(request.headers),
    });
  }

  return jsonOk({
    user: { id: data.user.id, email: data.user.email },
    requiresEmailConfirmation: !data.session,
    redirectTo: data.session ? "/onboarding" : "/auth/login",
  }, 201);
}
