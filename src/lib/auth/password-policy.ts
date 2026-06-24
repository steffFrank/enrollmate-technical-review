/*
 * IncluDO AI Platform
 * Copyright (c) 2026 Steff (steffFrank). All rights reserved.
 */
import type { AppTranslationKey } from "@/lib/app-i18n";

export type PasswordRuleId =
  | "length"
  | "lowercase"
  | "uppercase"
  | "number"
  | "special"
  | "noSpaces"
  | "long";

export type PasswordRuleResult = {
  id: PasswordRuleId;
  labelKey: AppTranslationKey;
  passed: boolean;
  required: boolean;
};

export type PasswordStrength = "empty" | "weak" | "good" | "strong";

export const PASSWORD_POLICY_MESSAGE =
  "Password must be at least 8 characters and include uppercase, lowercase, number, and special characters.";

const SPECIAL_CHARACTER_PATTERN = /[^A-Za-z0-9\s]/;

export function evaluatePasswordRules(password: string): PasswordRuleResult[] {
  return [
    {
      id: "length",
      labelKey: "passwordRuleLength",
      passed: password.length >= 8,
      required: true,
    },
    {
      id: "lowercase",
      labelKey: "passwordRuleLowercase",
      passed: /[a-z]/.test(password),
      required: true,
    },
    {
      id: "uppercase",
      labelKey: "passwordRuleUppercase",
      passed: /[A-Z]/.test(password),
      required: true,
    },
    {
      id: "number",
      labelKey: "passwordRuleNumber",
      passed: /\d/.test(password),
      required: true,
    },
    {
      id: "special",
      labelKey: "passwordRuleSpecial",
      passed: SPECIAL_CHARACTER_PATTERN.test(password),
      required: true,
    },
    {
      id: "noSpaces",
      labelKey: "passwordRuleNoSpaces",
      passed: password.length > 0 && !/\s/.test(password),
      required: true,
    },
    {
      id: "long",
      labelKey: "passwordRuleLong",
      passed: password.length >= 12,
      required: false,
    },
  ];
}

export function isPasswordPolicySatisfied(password: string): boolean {
  return evaluatePasswordRules(password)
    .filter((rule) => rule.required)
    .every((rule) => rule.passed);
}

export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) return "empty";

  const rules = evaluatePasswordRules(password);
  const requiredRulesPassed = rules.filter((rule) => rule.required).every((rule) => rule.passed);
  if (!requiredRulesPassed) return "weak";

  const longRulePassed = rules.find((rule) => rule.id === "long")?.passed ?? false;
  return longRulePassed ? "strong" : "good";
}
