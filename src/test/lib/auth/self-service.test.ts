import { afterEach, describe, expect, it } from "vitest";
import { isSelfServiceSignupEnabled, safeAuthRedirect } from "@/lib/auth/self-service";

const ORIGINAL_VALUE = process.env.NEXT_PUBLIC_SELF_SERVICE_SIGNUP_ENABLED;

afterEach(() => {
  if (ORIGINAL_VALUE === undefined) delete process.env.NEXT_PUBLIC_SELF_SERVICE_SIGNUP_ENABLED;
  else process.env.NEXT_PUBLIC_SELF_SERVICE_SIGNUP_ENABLED = ORIGINAL_VALUE;
});

describe("self-service signup helpers", () => {
  it("enables signup by default", () => {
    delete process.env.NEXT_PUBLIC_SELF_SERVICE_SIGNUP_ENABLED;
    expect(isSelfServiceSignupEnabled()).toBe(true);
  });

  it("disables signup for explicit false-like values", () => {
    process.env.NEXT_PUBLIC_SELF_SERVICE_SIGNUP_ENABLED = "false";
    expect(isSelfServiceSignupEnabled()).toBe(false);

    process.env.NEXT_PUBLIC_SELF_SERVICE_SIGNUP_ENABLED = "0";
    expect(isSelfServiceSignupEnabled()).toBe(false);
  });

  it("keeps auth redirects internal", () => {
    expect(safeAuthRedirect("/onboarding")).toBe("/onboarding");
    expect(safeAuthRedirect("https://evil.example")).toBe("/dashboard");
    expect(safeAuthRedirect("//evil.example")).toBe("/dashboard");
    expect(safeAuthRedirect(null)).toBe("/dashboard");
  });
});
