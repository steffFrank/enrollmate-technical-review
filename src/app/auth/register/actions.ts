/*
 * IncluDO AI Platform
 * Copyright (c) 2026 Steff (steffFrank). All rights reserved.
 */
"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { action } from "@/lib/actions/action";
import { isPasswordPolicySatisfied, PASSWORD_POLICY_MESSAGE } from "@/lib/auth/password-policy";
import { registerSession } from "@/lib/auth/session-registry";
import { isSelfServiceSignupEnabled } from "@/lib/auth/self-service";
import { getAuthSiteUrl } from "@/lib/auth/site-url";
import { validateCaptchaToken } from "@/lib/auth/turnstile";
import type { AppTranslationKey } from "@/lib/app-i18n";

const registerSchema = z
  .object({
    fullName: z.string().trim().max(120, "Full name is too long.").optional(),
    email: z.string().email("Please enter a valid email address."),
    password: z.string().refine(isPasswordPolicySatisfied, { message: PASSWORD_POLICY_MESSAGE }),
    confirmPassword: z.string().min(1, "Please confirm your password."),
    acceptTerms: z.string().refine((value) => value === "on", {
      message: "You must accept the privacy notice to create an account.",
    }),
    captchaToken: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export type RegisterActionState = {
  error?: string;
  success?: string;
  successKey?: AppTranslationKey;
} | null;

export async function registerWithPassword(
  _prevState: RegisterActionState,
  formData: FormData,
): Promise<RegisterActionState> {
  if (!isSelfServiceSignupEnabled()) {
    return { error: "Self-service signup is not available for this deployment." };
  }

  const result = await action({
    params: {
      fullName: String(formData.get("fullName") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      confirmPassword: String(formData.get("confirmPassword") ?? ""),
      acceptTerms: String(formData.get("acceptTerms") ?? ""),
      captchaToken: String(formData.get("captchaToken") ?? ""),
    },
    schema: registerSchema,
    authorize: false,
  });

  if (!result.success) {
    return { error: result.error.issues?.[0] ?? result.error.message };
  }

  const { email, password, fullName } = result.data.params;
  const captchaToken = validateCaptchaToken(result.data.params.captchaToken);
  if (captchaToken && typeof captchaToken !== "string") return { error: captchaToken.error };

  const siteUrl = await getAuthSiteUrl();
  const { data, error } = await result.data.supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName || null },
      emailRedirectTo: `${siteUrl}/auth/callback?next=/onboarding`,
      ...(captchaToken ? { captchaToken } : {}),
    },
  });

  if (error) {
    console.error("[registerWithPassword]", error.message);
    return { error: "Could not create the account. Check the email and password, then try again." };
  }

  if (!data.session) {
    return { successKey: "authConfirmEmail" };
  }

  const h = await headers();
  await registerSession({
    user: data.session.user,
    accessToken: data.session.access_token,
    userAgent: h.get("user-agent"),
    ipAddress: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip"),
  });

  redirect("/onboarding");
}
