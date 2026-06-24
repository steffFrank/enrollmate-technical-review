/*
 * IncluDO AI Platform
 * Copyright (c) 2026 Steff (steffFrank). All rights reserved.
 */
"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { loginWithPassword, sendMagicLink, type AuthActionState } from "./actions";
import { Eye, EyeOff, Loader2, Mail, Lock, Sparkles } from "lucide-react";
import { useAppLanguage } from "@/components/i18n/AppLanguageProvider";
import { TurnstileField } from "@/components/auth/turnstile-field";
import Link from "next/link";

// ---------------------------------------------------------------------------
// Submit button (reads useFormStatus from the wrapping <form>)
// ---------------------------------------------------------------------------

function SubmitButton({ label, loadingLabel }: { label: string; loadingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" aria-hidden />
          {loadingLabel}
        </>
      ) : (
        label
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Input component
// ---------------------------------------------------------------------------

function InputField({
  id,
  name,
  type,
  label,
  placeholder,
  autoComplete,
  required,
  icon: Icon,
  rightElement,
}: {
  id: string;
  name: string;
  type: string;
  label: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  rightElement?: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <input
          id={id}
          name={name}
          type={type}
          autoComplete={autoComplete}
          required={required}
          placeholder={placeholder}
          className="w-full rounded-lg border border-border bg-card py-2.5 pl-9 pr-10 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-ring focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring"
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightElement}</div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main form component
// ---------------------------------------------------------------------------

type Tab = "password" | "magic";

type Props = {
  next?: string;
  signupEnabled?: boolean;
  turnstileSiteKey?: string | null;
};

export function LoginForm({ next, signupEnabled = false, turnstileSiteKey }: Props) {
  const { t } = useAppLanguage();
  const [tab, setTab] = useState<Tab>("password");
  const [showPassword, setShowPassword] = useState(false);

  const [passwordState, passwordAction] = useActionState<AuthActionState, FormData>(
    loginWithPassword,
    null,
  );
  const [magicState, magicAction] = useActionState<AuthActionState, FormData>(
    sendMagicLink,
    null,
  );

  return (
    <div className="space-y-5">
      {/* Tab switcher */}
      <div className="flex rounded-lg border border-border bg-card p-1">
        <TabButton active={tab === "password"} onClick={() => setTab("password")}>
          {t("authPassword")}
        </TabButton>
        <TabButton active={tab === "magic"} onClick={() => setTab("magic")}>
          {t("authMagicLink")}
        </TabButton>
      </div>

      {/* Password form */}
      {tab === "password" && (
        <form action={passwordAction} className="space-y-4">
          {next && <input type="hidden" name="next" value={next} />}

          <InputField
            id="email"
            name="email"
            type="email"
            label="Email"
            placeholder="you@company.com"
            autoComplete="email"
            required
            icon={Mail}
          />

          <InputField
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            label={t("authPassword")}
            placeholder="••••••••"
            autoComplete="current-password"
            required
            icon={Lock}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded"
                aria-label={showPassword ? t("authHidePassword") : t("authShowPassword")}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            }
          />

          {passwordState?.error && (
            <ErrorBanner message={passwordState.error} />
          )}

          <TurnstileField siteKey={turnstileSiteKey} resetSignal={passwordState} />

          <SubmitButton label={t("authSignIn")} loadingLabel={t("authSigningIn")} />
        </form>
      )}

      {/* Magic link form */}
      {tab === "magic" && (
        <form action={magicAction} className="space-y-4">
          {next && <input type="hidden" name="next" value={next} />}

          <InputField
            id="email-magic"
            name="email"
            type="email"
            label="Email"
            placeholder="you@company.com"
            autoComplete="email"
            required
            icon={Mail}
          />

          {magicState?.error && <ErrorBanner message={magicState.error} />}
          {magicState?.success && (
            <div
              role="status"
              className="flex items-start gap-2.5 rounded-lg border border-success/30 bg-success-soft px-3.5 py-3 text-sm text-success"
            >
              <Sparkles className="mt-0.5 size-4 shrink-0" aria-hidden />
              {magicState.success}
            </div>
          )}

          <TurnstileField siteKey={turnstileSiteKey} resetSignal={magicState} />

          <SubmitButton label={t("authSendLink")} loadingLabel={t("authSending")} />

          <p className="text-center text-xs text-muted-foreground">
            {t("authLinkHelp")}
          </p>
        </form>
      )}

      {signupEnabled && (
        <p className="text-center text-xs text-muted-foreground">
          {t("authNoAccount")}{" "}
          <Link href="/auth/register" className="font-semibold text-primary hover:underline">
            {t("authRegisterLink")}
          </Link>
        </p>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-md py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3.5 py-3 text-sm text-destructive"
    >
      <svg
        className="mt-0.5 size-4 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
        />
      </svg>
      {message}
    </div>
  );
}
