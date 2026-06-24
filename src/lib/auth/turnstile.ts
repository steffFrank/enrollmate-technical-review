/*
 * IncluDO AI Platform
 * Copyright (c) 2026 Steff (steffFrank). All rights reserved.
 */

export const CAPTCHA_REQUIRED_MESSAGE = "Please complete the security check.";

export function getTurnstileSiteKey(): string | null {
  return process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || null;
}

export function isTurnstileEnabled(): boolean {
  return Boolean(getTurnstileSiteKey());
}

export function normalizeCaptchaToken(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const token = value.trim();
  return token.length > 0 ? token : undefined;
}

export function validateCaptchaToken(value: unknown): string | { error: string } | undefined {
  const token = normalizeCaptchaToken(value);
  if (isTurnstileEnabled() && !token) return { error: CAPTCHA_REQUIRED_MESSAGE };
  return token;
}
