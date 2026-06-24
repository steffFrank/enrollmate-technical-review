/*
 * IncluDO AI Platform
 * Copyright (c) 2026 Steff (steffFrank). All rights reserved.
 */
import { type NextRequest } from "next/server";
import { z } from "zod";
import { registerSession } from "@/lib/auth/session-registry";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { safeAuthRedirect } from "@/lib/auth/self-service";
import { validateCaptchaToken } from "@/lib/auth/turnstile";
import { getClientIp } from "@/lib/rate-limit";
import { jsonError, jsonOk } from "@/lib/http";

export const runtime = "nodejs";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  next: z.string().optional(),
  captchaToken: z.string().optional(),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body.", 400);
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Validation failed.", 422, { issues: parsed.error.flatten().fieldErrors });
  }

  const captchaToken = validateCaptchaToken(parsed.data.captchaToken);
  if (captchaToken && typeof captchaToken !== "string") {
    return jsonError(captchaToken.error, 400);
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
    ...(captchaToken ? { options: { captchaToken } } : {}),
  });

  if (error || !data.session) {
    return jsonError("Invalid email or password.", 401);
  }

  await registerSession({
    user: data.session.user,
    accessToken: data.session.access_token,
    userAgent: request.headers.get("user-agent"),
    ipAddress: getClientIp(request.headers),
  });

  return jsonOk({
    user: { id: data.session.user.id, email: data.session.user.email },
    redirectTo: safeAuthRedirect(parsed.data.next),
  });
}
