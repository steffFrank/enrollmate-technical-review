/*
 * IncluDO AI Platform
 * Copyright (c) 2026 Steff (steffFrank). All rights reserved.
 */
"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import { action } from "@/lib/actions/action";
import { registerSession } from "@/lib/auth/session-registry";
import { safeAuthRedirect } from "@/lib/auth/self-service";
import { getAuthSiteUrl } from "@/lib/auth/site-url";
import { validateCaptchaToken } from "@/lib/auth/turnstile";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
  next: z.string().optional(),
  captchaToken: z.string().optional(),
});

const magicLinkSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  next: z.string().optional(),
  captchaToken: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Response type shared with the login page
// ---------------------------------------------------------------------------

export type AuthActionState = {
  error?: string;
  success?: string;
} | null;

// ---------------------------------------------------------------------------
// loginWithPassword
// ---------------------------------------------------------------------------

export async function loginWithPassword(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const result = await action({
    params: {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      next: String(formData.get("next") ?? ""),
      captchaToken: String(formData.get("captchaToken") ?? ""),
    },
    schema: loginSchema,
    authorize: false,
  });

  if (!result.success) {
    return { error: result.error.issues?.[0] ?? result.error.message };
  }

  const { email, password, next } = result.data.params;
  const captchaToken = validateCaptchaToken(result.data.params.captchaToken);
  if (captchaToken && typeof captchaToken !== "string") return { error: captchaToken.error };

  const { data, error } = await result.data.supabase.auth.signInWithPassword({
    email,
    password,
    ...(captchaToken ? { options: { captchaToken } } : {}),
  });

  if (error || !data.session) {
    return { error: "Invalid email or password." };
  }

  const h = await headers();
  await registerSession({
    user: data.session.user,
    accessToken: data.session.access_token,
    userAgent: h.get("user-agent"),
    ipAddress: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip"),
  });

  redirect(safeAuthRedirect(next));
}

// ---------------------------------------------------------------------------
// sendMagicLink
// ---------------------------------------------------------------------------

export async function sendMagicLink(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const result = await action({
    params: {
      email: String(formData.get("email") ?? ""),
      next: String(formData.get("next") ?? ""),
      captchaToken: String(formData.get("captchaToken") ?? ""),
    },
    schema: magicLinkSchema,
    authorize: false,
  });

  if (!result.success) {
    return { error: result.error.issues?.[0] ?? result.error.message };
  }

  const { email, next } = result.data.params;
  const captchaToken = validateCaptchaToken(result.data.params.captchaToken);
  if (captchaToken && typeof captchaToken !== "string") return { error: captchaToken.error };

  const siteUrl = await getAuthSiteUrl();
  const redirectPath = safeAuthRedirect(next);

  const { error } = await result.data.supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(redirectPath)}`,
      ...(captchaToken ? { captchaToken } : {}),
    },
  });

  if (error) {
    console.error("[sendMagicLink]", error.message);
    return { error: "Failed to send magic link. Please try again." };
  }

  return { success: "Check your inbox — a login link is on its way." };
}
