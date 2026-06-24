/*
 * IncluDO AI Platform
 * Copyright (c) 2026 Steff (steffFrank). All rights reserved.
 *
 * Root dashboard layout. The proxy already redirects unauthenticated users
 * to /auth/login, but we do a server-side auth check here too as defense-in-depth.
 */
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth/get-server-user";

export const metadata: Metadata = {
  title: { template: "%s — EnrollMate Dashboard", default: "Dashboard — EnrollMate" },
  robots: { index: false },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerUser();
  if (!user) redirect("/auth/login");

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      {children}
    </div>
  );
}
