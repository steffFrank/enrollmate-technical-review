/*
 * IncluDO AI Platform
 * Copyright (c) 2026 Steff (steffFrank). All rights reserved.
 */
"use client";

import { CheckCircle2, Circle, XCircle } from "lucide-react";
import { useMemo } from "react";
import { useAppLanguage } from "@/components/i18n/AppLanguageProvider";
import { evaluatePasswordRules, getPasswordStrength } from "@/lib/auth/password-policy";

const strengthClasses = {
  empty: "bg-muted",
  weak: "bg-destructive",
  good: "bg-warning",
  strong: "bg-success",
} as const;

const strengthWidth = {
  empty: "w-0",
  weak: "w-1/3",
  good: "w-2/3",
  strong: "w-full",
} as const;

const strengthLabelKeys = {
  empty: "passwordStrengthEmpty",
  weak: "passwordStrengthWeak",
  good: "passwordStrengthGood",
  strong: "passwordStrengthStrong",
} as const;

export function PasswordStrengthChecklist({ password }: { password: string }) {
  const { t } = useAppLanguage();
  const rules = useMemo(() => evaluatePasswordRules(password), [password]);
  const strength = getPasswordStrength(password);

  return (
    <div className="rounded-lg border border-border bg-secondary/40 p-3" aria-live="polite">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-foreground">{t("passwordStrengthLabel")}</p>
        <p className="text-xs font-semibold text-muted-foreground">{t(strengthLabelKeys[strength])}</p>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full transition-all ${strengthWidth[strength]} ${strengthClasses[strength]}`} />
      </div>
      <ul className="mt-3 grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2">
        {rules.map((rule) => {
          const Icon = password.length === 0 ? Circle : rule.passed ? CheckCircle2 : XCircle;
          return (
            <li key={rule.id} className={rule.passed ? "flex items-center gap-1.5 text-success" : "flex items-center gap-1.5"}>
              <Icon className="size-3.5 shrink-0" aria-hidden />
              <span>{t(rule.labelKey)}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
