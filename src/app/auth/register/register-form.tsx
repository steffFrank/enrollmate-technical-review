/*
 * IncluDO AI Platform
 * Copyright (c) 2026 Steff (steffFrank). All rights reserved.
 */
"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { AlertTriangle, CheckCircle2, Eye, EyeOff, Loader2, Lock, Mail, User, X } from "lucide-react";
import { registerWithPassword, type RegisterActionState } from "./actions";
import { PasswordStrengthChecklist } from "@/components/auth/password-strength";
import { TurnstileField } from "@/components/auth/turnstile-field";
import { useAppLanguage } from "@/components/i18n/AppLanguageProvider";

const inputClass =
  "w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-ring focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring";

const TOAST_VISIBLE_MS = 9000;

function SubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useAppLanguage();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {pending ? t("authCreatingAccount") : t("authCreateAccount")}
    </button>
  );
}

function PasswordToggle({ shown, onToggle }: { shown: boolean; onToggle: () => void }) {
  const { t } = useAppLanguage();
  return (
    <button
      type="button"
      onClick={onToggle}
      className="rounded text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      aria-label={shown ? t("authHidePassword") : t("authShowPassword")}
    >
      {shown ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
    </button>
  );
}

function EmailConfirmationToast({
  title,
  message,
  dismissLabel,
  onDismiss,
}: {
  title: string;
  message: string;
  dismissLabel: string;
  onDismiss: () => void;
}) {
  return (
    <div className="fixed inset-x-4 top-4 z-50 flex justify-center sm:inset-x-auto sm:right-6 sm:block">
      <div
        role="status"
        aria-live="polite"
        className="w-full max-w-sm rounded-xl border border-success/30 bg-card p-4 text-card-foreground shadow-2xl ring-1 ring-black/5"
      >
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-success-soft text-success">
            <CheckCircle2 className="size-4" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">{title}</p>
            <p className="mt-1 text-sm leading-5 text-muted-foreground">{message}</p>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            aria-label={dismissLabel}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}

export function RegisterForm({ turnstileSiteKey }: { turnstileSiteKey?: string | null }) {
  const { t } = useAppLanguage();
  const [state, dispatch] = useActionState<RegisterActionState, FormData>(registerWithPassword, null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const successMessage = state?.successKey ? t(state.successKey) : state?.success;

  useEffect(() => {
    if (!successMessage) {
      setToastMessage(null);
      return;
    }

    setToastMessage(successMessage);
    const timeout = window.setTimeout(() => setToastMessage(null), TOAST_VISIBLE_MS);
    return () => window.clearTimeout(timeout);
  }, [state, successMessage]);

  return (
    <>
      {toastMessage && (
        <EmailConfirmationToast
          title={t("authConfirmEmailToastTitle")}
          message={toastMessage}
          dismissLabel={t("authDismissNotification")}
          onDismiss={() => setToastMessage(null)}
        />
      )}

      <form action={dispatch} className="space-y-4">
      {state?.error && (
        <div role="alert" className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3.5 py-3 text-sm text-destructive">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
          {state.error}
        </div>
      )}

      {state?.success && (
        <div role="status" className="flex items-start gap-2.5 rounded-lg border border-success/30 bg-success-soft px-3.5 py-3 text-sm text-success">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden />
          {state.successKey ? t(state.successKey) : state.success}
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="fullName" className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t("authFullName")}
        </label>
        <div className="relative">
          <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input id="fullName" name="fullName" type="text" autoComplete="name" maxLength={120} className={`${inputClass} pl-9`} placeholder="Maria Rossi" />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Email
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input id="email" name="email" type="email" autoComplete="email" required className={`${inputClass} pl-9`} placeholder="admin@school.edu" />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t("authPassword")}
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            minLength={8}
            className={`${inputClass} pl-9 pr-10`}
            onChange={(event) => setPassword(event.currentTarget.value)}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <PasswordToggle shown={showPassword} onToggle={() => setShowPassword((value) => !value)} />
          </div>
        </div>
        <PasswordStrengthChecklist password={password} />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="confirmPassword" className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t("authConfirmPassword")}
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} autoComplete="new-password" required minLength={8} className={`${inputClass} pl-9 pr-10`} />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <PasswordToggle shown={showConfirmPassword} onToggle={() => setShowConfirmPassword((value) => !value)} />
          </div>
        </div>
      </div>

      <label className="flex items-start gap-3 rounded-lg border border-border bg-secondary/50 p-3 text-xs leading-5 text-muted-foreground">
        <input name="acceptTerms" type="checkbox" required className="mt-1 size-4 rounded border-border" />
        <span>
          {t("authPrivacyAccept")}
          {" "}
          <Link href="/privacy" className="font-semibold text-primary hover:underline">{t("authPrivacyLink")}</Link>
        </span>
      </label>

      <TurnstileField siteKey={turnstileSiteKey} resetSignal={state} />

      <SubmitButton />

      <p className="text-center text-xs text-muted-foreground">
        {t("authHaveAccount")}{" "}
        <Link href="/auth/login" className="font-semibold text-primary hover:underline">
          {t("authSignIn")}
        </Link>
      </p>
      </form>
    </>
  );
}
