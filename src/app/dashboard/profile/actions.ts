/*
 * IncluDO AI Platform
 * Copyright (c) 2026 Steff (steffFrank). All rights reserved.
 */
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { action } from "@/lib/actions/action";
import { isPasswordPolicySatisfied, PASSWORD_POLICY_MESSAGE } from "@/lib/auth/password-policy";
import { getAuthSiteUrl } from "@/lib/auth/site-url";
import type { AppTranslationKey } from "@/lib/app-i18n";

const profileSchema = z.object({
  fullName: z.string().trim().max(120, "Full name is too long."),
  preferredLanguage: z.string().refine((value) => ["it", "en", "fr"].includes(value), {
    message: "Unsupported language.",
  }),
});

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    password: z.string().refine(isPasswordPolicySatisfied, { message: PASSWORD_POLICY_MESSAGE }),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export type ProfileActionState = {
  error?: string;
  success?: string;
  successKey?: AppTranslationKey;
} | null;

type AuthUpdateError = {
  message?: string;
  name?: string;
  status?: number;
  code?: string;
};

function passwordUpdateErrorMessage(error: AuthUpdateError): string {
  const message = error.message?.trim();
  const normalized = `${error.name ?? ""} ${error.code ?? ""} ${message ?? ""}`.toLowerCase();

  if (normalized.includes("session") || normalized.includes("jwt") || normalized.includes("token")) {
    return "Your session expired. Sign in again before changing your password.";
  }

  if (normalized.includes("current password")) {
    if (
      normalized.includes("invalid") ||
      normalized.includes("incorrect") ||
      normalized.includes("wrong")
    ) {
      return "The current password is incorrect.";
    }
    return "Enter your current password to change it.";
  }

  if (
    normalized.includes("same") ||
    normalized.includes("different") ||
    normalized.includes("already")
  ) {
    return "Choose a new password that is different from your current password.";
  }

  if (normalized.includes("weak") || normalized.includes("password")) {
    return message || PASSWORD_POLICY_MESSAGE;
  }

  return "Could not update your password. Please try again.";
}

export async function updateUserProfileAction(
  _prevState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const result = await action({
    params: {
      fullName: String(formData.get("fullName") ?? ""),
      preferredLanguage: String(formData.get("preferredLanguage") ?? "it"),
    },
    schema: profileSchema,
    authorize: true,
    requireFreshSession: false,
  });

  if (!result.success) {
    return { error: result.error.issues?.[0] ?? result.error.message };
  }

  const { fullName, preferredLanguage } = result.data.params;
  const { error } = await result.data.supabase.auth.updateUser({
    data: {
      full_name: fullName || null,
      preferred_language: preferredLanguage,
    },
  });

  if (error) {
    console.error("[updateUserProfileAction]", error.message);
    return { error: "Could not update your profile. Please try again." };
  }

  revalidatePath("/dashboard/profile");
  return { successKey: "profileUpdated" };
}

export async function updateUserEmailAction(
  _prevState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const result = await action({
    params: { email: String(formData.get("email") ?? "") },
    schema: emailSchema,
    authorize: true,
    requireFreshSession: true,
  });

  if (!result.success) {
    return { error: result.error.issues?.[0] ?? result.error.message };
  }

  const email = result.data.params.email.trim().toLowerCase();
  const currentEmail = result.data.user?.email?.trim().toLowerCase();
  if (currentEmail === email) return { successKey: "profileEmailUnchanged" };

  const siteUrl = await getAuthSiteUrl();
  const { error } = await result.data.supabase.auth.updateUser(
    { email },
    { emailRedirectTo: `${siteUrl}/auth/callback?next=/dashboard/profile` },
  );

  if (error) {
    console.error("[updateUserEmailAction]", error.message);
    return { error: error.message || "Could not update your email. Please try again." };
  }

  revalidatePath("/dashboard/profile");
  return { successKey: "profileEmailUpdated" };
}

export async function updateUserPasswordAction(
  _prevState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const result = await action({
    params: {
      currentPassword: String(formData.get("currentPassword") ?? ""),
      password: String(formData.get("password") ?? ""),
      confirmPassword: String(formData.get("confirmPassword") ?? ""),
    },
    schema: passwordSchema,
    authorize: true,
    requireFreshSession: true,
  });

  if (!result.success) {
    return { error: result.error.issues?.[0] ?? result.error.message };
  }

  const { error } = await result.data.supabase.auth.updateUser({
    current_password: result.data.params.currentPassword,
    password: result.data.params.password,
  });

  if (error) {
    console.error("[updateUserPasswordAction]", error.message);
    return { error: passwordUpdateErrorMessage(error) };
  }

  return { successKey: "profilePasswordUpdated" };
}
