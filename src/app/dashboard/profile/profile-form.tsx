/*
 * IncluDO AI Platform
 * Copyright (c) 2026 Steff (steffFrank). All rights reserved.
 */
"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { AlertTriangle, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import {
  updateUserEmailAction,
  updateUserPasswordAction,
  updateUserProfileAction,
  type ProfileActionState,
} from "./actions";
import { PasswordStrengthChecklist } from "@/components/auth/password-strength";
import { APP_LOCALE_LABELS, APP_LOCALES, type AppLocale, type AppTranslationKey } from "@/lib/app-i18n";
import { useAppLanguage } from "@/components/i18n/AppLanguageProvider";

type Props = {
  fullName: string;
  preferredLanguage: AppLocale;
};

function SubmitButton({ labelKey, loadingKey }: { labelKey: AppTranslationKey; loadingKey: AppTranslationKey }) {
  const { pending } = useFormStatus();
  const { t } = useAppLanguage();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {pending ? t(loadingKey) : t(labelKey)}
    </button>
  );
}

function StatusMessage({ state }: { state: ProfileActionState }) {
  const { t } = useAppLanguage();
  if (state?.error) {
    return (
      <div role="alert" className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
        {state.error}
      </div>
    );
  }

  if (state?.success || state?.successKey) {
    return (
      <div role="status" className="flex items-start gap-2.5 rounded-lg border border-success/30 bg-success-soft px-4 py-3 text-sm text-success">
        <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden />
        {state.successKey ? t(state.successKey) : state.success}
      </div>
    );
  }

  return null;
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

export function ProfileForm({ fullName, preferredLanguage }: Props) {
  const { t } = useAppLanguage();
  const [state, dispatch] = useActionState<ProfileActionState, FormData>(updateUserProfileAction, null);

  return (
    <form action={dispatch} className="space-y-5">
      <StatusMessage state={state} />

      <div className="space-y-1.5">
        <label htmlFor="fullName" className="block text-sm font-medium text-foreground">
          {t("authFullName")}
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          defaultValue={fullName}
          maxLength={120}
          autoComplete="name"
          className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          placeholder="Maria Rossi"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="preferredLanguage" className="block text-sm font-medium text-foreground">
          {t("profilePreferredLanguage")}
        </label>
        <select
          id="preferredLanguage"
          name="preferredLanguage"
          defaultValue={preferredLanguage}
          className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {APP_LOCALES.map((locale) => (
            <option key={locale} value={locale}>
              {APP_LOCALE_LABELS[locale]}
            </option>
          ))}
        </select>
      </div>

      <SubmitButton labelKey="profileSave" loadingKey="profileSaving" />
    </form>
  );
}

export function AccountSecurityForms({ email }: { email: string }) {
  const { t } = useAppLanguage();
  const [emailState, emailDispatch] = useActionState<ProfileActionState, FormData>(updateUserEmailAction, null);
  const [passwordState, passwordDispatch] = useActionState<ProfileActionState, FormData>(updateUserPasswordAction, null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");

  return (
    <div className="space-y-6 rounded-xl border border-border bg-background p-4">
      <div>
        <h2 className="text-base font-semibold text-foreground">{t("profileSecurityTitle")}</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{t("profileSecurityBody")}</p>
      </div>

      <form action={emailDispatch} className="space-y-4">
        <StatusMessage state={emailState} />
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-sm font-medium text-foreground">
            {t("profileNewEmail")}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={email}
            required
            autoComplete="email"
            className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <SubmitButton labelKey="profileUpdateEmail" loadingKey="profileUpdatingEmail" />
      </form>

      <div className="h-px bg-border" />

      <form action={passwordDispatch} className="space-y-4">
        <StatusMessage state={passwordState} />
        <div className="space-y-1.5">
          <label htmlFor="currentPassword" className="block text-sm font-medium text-foreground">
            {t("authCurrentPassword")}
          </label>
          <div className="relative">
            <input
              id="currentPassword"
              name="currentPassword"
              type={showCurrentPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <PasswordToggle shown={showCurrentPassword} onToggle={() => setShowCurrentPassword((value) => !value)} />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-sm font-medium text-foreground">
            {t("authNewPassword")}
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
              onChange={(event) => setPassword(event.currentTarget.value)}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <PasswordToggle shown={showPassword} onToggle={() => setShowPassword((value) => !value)} />
            </div>
          </div>
          <PasswordStrengthChecklist password={password} />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">
            {t("authConfirmPassword")}
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <PasswordToggle shown={showConfirmPassword} onToggle={() => setShowConfirmPassword((value) => !value)} />
            </div>
          </div>
        </div>

        <SubmitButton labelKey="profileUpdatePassword" loadingKey="profileUpdatingPassword" />
      </form>
    </div>
  );
}
