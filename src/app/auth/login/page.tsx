/*
 * IncluDO AI Platform
 * Copyright (c) 2026 Steff (steffFrank). All rights reserved.
 */
import type { Metadata } from "next";
import { LoginForm } from "./login-form";
import Image from "next/image";
import Link from "next/link";
import { PLATFORM } from "@/lib/platform";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { appText } from "@/lib/app-i18n";
import { getAppLocale } from "@/lib/app-i18n.server";
import { isSelfServiceSignupEnabled } from "@/lib/auth/self-service";
import { getTurnstileSiteKey } from "@/lib/auth/turnstile";

export const metadata: Metadata = {
  title: "Sign in — EnrollMate",
  description: "Sign in to your EnrollMate dashboard.",
  robots: { index: false },
};

type Props = {
  searchParams: Promise<{ confirmed?: string; error?: string; next?: string }>;
};

const ERROR_MESSAGES: Record<string, string> = {
  auth_failed: "Authentication failed. The link may have expired — please try again.",
  link_expired: "Your login link has expired. Please request a new one.",
  unknown: "Something went wrong. Please try signing in again.",
};

export default async function LoginPage({ searchParams }: Props) {
  const locale = await getAppLocale();
  const { confirmed, error: errorCode, next } = await searchParams;
  const callbackError = errorCode ? (ERROR_MESSAGES[errorCode] ?? "An error occurred.") : null;
  const callbackSuccess = confirmed === "email" ? "Email confirmed. Sign in to continue." : null;
  const signupEnabled = isSelfServiceSignupEnabled();
  const turnstileSiteKey = getTurnstileSiteKey();

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <div className="fixed right-5 top-5 z-10 flex items-center gap-2">
        <LanguageSwitcher compact />
        <ThemeToggle />
      </div>
      {/* Subtle grid overlay */}
      <div
        aria-hidden
        className="landing-grid pointer-events-none fixed inset-0 opacity-60"
      />

      <div className="relative flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <Link href="/" className="inline-flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Image
                src={PLATFORM.logo}
                alt={PLATFORM.name}
                width={PLATFORM.logoWidth}
                height={PLATFORM.logoHeight}
                className="h-8 w-auto dark:brightness-200"
                unoptimized
                priority
              />
            </Link>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-border bg-card shadow-2xl backdrop-blur-sm">
            <div className="px-8 pb-8 pt-8">
              <div className="mb-6 text-center">
                <h1 className="text-xl font-semibold text-foreground">{appText(locale, "authWelcome")}</h1>
                <p className="mt-1 text-sm text-muted-foreground">{appText(locale, "authSubtitle")}</p>
              </div>

              {callbackError && (
                <div
                  role="alert"
                  className="mb-5 flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3.5 py-3 text-sm text-destructive"
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
                  {callbackError}
                </div>
              )}

              {callbackSuccess && (
                <div
                  role="status"
                  className="mb-5 flex items-start gap-2.5 rounded-lg border border-success/30 bg-success-soft px-3.5 py-3 text-sm text-success"
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
                      d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                  {callbackSuccess}
                </div>
              )}

              <LoginForm next={next} signupEnabled={signupEnabled} turnstileSiteKey={turnstileSiteKey} />
            </div>
          </div>

          {/* Footer */}
          <p className="mt-8 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} {PLATFORM.name}. {appText(locale, "authRights")}
          </p>
        </div>
      </div>
    </div>
  );
}
