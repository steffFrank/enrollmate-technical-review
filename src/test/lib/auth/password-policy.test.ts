import { describe, expect, it } from "vitest";
import {
  evaluatePasswordRules,
  getPasswordStrength,
  isPasswordPolicySatisfied,
} from "@/lib/auth/password-policy";

describe("password policy", () => {
  it("rejects passwords missing required character classes", () => {
    expect(isPasswordPolicySatisfied("password")).toBe(false);
    expect(isPasswordPolicySatisfied("Password123")).toBe(false);
    expect(isPasswordPolicySatisfied("Password 123!")).toBe(false);
  });

  it("accepts passwords with uppercase, lowercase, number, special character and no spaces", () => {
    expect(isPasswordPolicySatisfied("Password123!")).toBe(true);
  });

  it("marks 12+ character compliant passwords as strong", () => {
    expect(getPasswordStrength("Password123!")).toBe("strong");
    expect(getPasswordStrength("Pass123!")).toBe("good");
  });

  it("returns localized rule keys for the checklist", () => {
    const rules = evaluatePasswordRules("Password123!");
    expect(rules.map((rule) => rule.labelKey)).toContain("passwordRuleSpecial");
    expect(rules.filter((rule) => rule.required).every((rule) => rule.passed)).toBe(true);
  });
});
