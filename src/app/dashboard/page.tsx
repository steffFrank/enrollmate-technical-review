/*
 * IncluDO AI Platform
 * Copyright (c) 2026 Steff (steffFrank). All rights reserved.
 *
 * /dashboard — redirects to the user's first org dashboard.
 * Platform admins who manage multiple orgs see an org picker (Phase 2.1).
 */
import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth/get-server-user";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export default async function DashboardPage() {
  const user = await getServerUser();
  if (!user) redirect("/auth/login");

  // Find the first org the user has access to.
  const db = getSupabaseAdmin();

  // Platform admins fall back to the first org in the system.
  const isPlatformAdmin =
    (user.app_metadata as Record<string, unknown>)?.platform_role === "platform_admin";

  if (isPlatformAdmin) {
    const { data } = await db
      .from("organizations")
      .select("slug")
      .eq("status", "active")
      .order("created_at")
      .limit(1)
      .maybeSingle();

    if (data?.slug) redirect(`/dashboard/${data.slug}`);
    redirect("/dashboard/no-organization");
  }

  const { data: membership } = await db
    .from("org_memberships")
    .select("organization_id, organizations(slug)")
    .eq("user_id", user.id)
    .order("created_at")
    .limit(1)
    .maybeSingle();

  const slug = (membership?.organizations as { slug?: string } | null)?.slug;
  if (slug) redirect(`/dashboard/${slug}`);
  redirect("/onboarding");
}
