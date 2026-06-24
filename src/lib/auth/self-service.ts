export function isSelfServiceSignupEnabled(): boolean {
  const value = process.env.NEXT_PUBLIC_SELF_SERVICE_SIGNUP_ENABLED;
  if (!value) return true;
  return !["0", "false", "no", "off"].includes(value.trim().toLowerCase());
}

export function safeAuthRedirect(value: unknown, fallback = "/dashboard"): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}
