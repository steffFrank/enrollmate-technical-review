/*
 * IncluDO AI Platform
 * Copyright (c) 2026 Steff (steffFrank). All rights reserved.
 */
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PLATFORM } from "@/lib/platform";
import { appText } from "@/lib/app-i18n";
import { getAppLocale } from "@/lib/app-i18n.server";
import { getServerUser } from "@/lib/auth/get-server-user";
import { isSelfServiceSignupEnabled } from "@/lib/auth/self-service";
import { getTurnstileSiteKey } from "@/lib/auth/turnstile";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Create account - EnrollMate",
  description: "Create an EnrollMate account and start a 14-day trial.",
  robots: { index: false },
};

export default async function RegisterPage() {
  const [locale, user] = await Promise.all([getAppLocale(), getServerUser()]);
  if (user) redirect("/dashboard");

  const signupEnabled = isSelfServiceSignupEnabled();
  const salesHref = process.env.SALES_CONTACT_URL ?? "mailto:sales@enrollmate.ai";
  const turnstileSiteKey = getTurnstileSiteKey();

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <div className="fixed right-5 top-5 z-10 flex items-center gap-2">
        <LanguageSwitcher compact />
        <ThemeToggle />
      </div>
      <div aria-hidden className="landing-grid pointer-events-none fixed inset-0 opacity-60" />

      <div className="relative flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
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

          <div className="rounded-2xl border border-border bg-card shadow-2xl backdrop-blur-sm">
            <div className="px-8 pb-8 pt-8">
              <div className="mb-6 text-center">
                <h1 className="text-xl font-semibold text-foreground">{appText(locale, "authRegisterTitle")}</h1>
                <p className="mt-1 text-sm text-muted-foreground">{appText(locale, "authRegisterSubtitle")}</p>
              </div>

              {signupEnabled ? (
                <RegisterForm turnstileSiteKey={turnstileSiteKey} />
              ) : (
                <div className="space-y-4 text-center">
                  <p className="text-sm leading-6 text-muted-foreground">
                    {appText(locale, "authSignupUnavailable")}
                  </p>
                  <a href={salesHref} className={cn(buttonVariants(), "w-full")}>
                    {appText(locale, "authBookDemo")} <ArrowRight className="size-4" aria-hidden />
                  </a>
                  <Link href="/auth/login" className="block text-sm font-semibold text-primary hover:underline">
                    {appText(locale, "authSignIn")}
                  </Link>
                </div>
              )}
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} {PLATFORM.name}. {appText(locale, "authRights")}
          </p>
        </div>
      </div>
    </div>
  );
}
