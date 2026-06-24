/*
 * IncluDO AI Platform
 * Copyright (c) 2026 Steff (steffFrank). All rights reserved.
 */
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { LogoutButton } from "@/components/dashboard/logout-button";
import { AccountSecurityForms, ProfileForm } from "./profile-form";
import { getServerUser } from "@/lib/auth/get-server-user";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { PLATFORM } from "@/lib/platform";
import { appText, resolveAppLocale } from "@/lib/app-i18n";
import { getAppLocale } from "@/lib/app-i18n.server";

export const metadata: Metadata = {
  title: "Profile - EnrollMate Dashboard",
  robots: { index: false },
};

type UserMetadata = {
  full_name?: string | null;
  preferred_language?: string | null;
};

export default async function ProfilePage() {
  const [user, locale] = await Promise.all([getServerUser(), getAppLocale()]);
  if (!user) redirect("/auth/login?next=/dashboard/profile");

  const metadata = user.user_metadata as UserMetadata;
  const db = getSupabaseAdmin();
  const { data: membership } = await db
    .from("org_memberships")
    .select("organization_id, role, organizations(name, slug)")
    .eq("user_id", user.id)
    .order("created_at")
    .limit(1)
    .maybeSingle();

  const org = membership?.organizations as { name?: string; slug?: string } | null;
  const dashboardHref = org?.slug ? `/dashboard/${org.slug}` : "/dashboard";
  const preferredLanguage = resolveAppLocale(metadata.preferred_language);

  return (
    <main className="min-h-dvh bg-background px-4 py-8 text-foreground sm:px-6">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="flex items-center justify-between gap-4">
          <Link href={dashboardHref} className="inline-flex items-center gap-2 rounded-md text-sm font-semibold text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <ArrowLeft className="size-4" aria-hidden />
            {appText(locale, "profileBack")}
          </Link>
          <LogoutButton />
        </div>

        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
          <div className="border-b border-border bg-secondary/60 px-6 py-5">
            <Image
              src={PLATFORM.logo}
              alt={PLATFORM.name}
              width={PLATFORM.logoWidth}
              height={PLATFORM.logoHeight}
              className="h-7 w-auto dark:brightness-200"
              unoptimized
            />
          </div>

          <div className="grid gap-8 p-6 md:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">{appText(locale, "profileEyebrow")}</p>
                <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground">{appText(locale, "profileTitle")}</h1>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {appText(locale, "profileBody")}
                </p>
              </div>

              <dl className="space-y-3 rounded-xl border border-border bg-background p-4 text-sm">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{appText(locale, "profileEmail")}</dt>
                  <dd className="mt-1 break-all font-medium text-foreground">{user.email}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{appText(locale, "profileOrganization")}</dt>
                  <dd className="mt-1 font-medium text-foreground">{org?.name ?? appText(locale, "profileNoOrganization")}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{appText(locale, "profileRole")}</dt>
                  <dd className="mt-1 font-medium text-foreground">{(membership?.role as string | undefined) ?? appText(locale, "profilePendingOnboarding")}</dd>
                </div>
              </dl>
            </div>

            <div className="space-y-6">
              <ProfileForm
                fullName={metadata.full_name ?? ""}
                preferredLanguage={preferredLanguage}
              />
              <AccountSecurityForms email={user.email ?? ""} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
