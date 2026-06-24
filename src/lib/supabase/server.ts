/*
 * IncluDO AI Platform
 * Copyright (c) 2026 Steff (steffFrank). All rights reserved.
 */
import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Cookie-based Supabase client for server components, server actions, and
 * route handlers. Automatically refreshes the session token via cookie writes.
 *
 * NOTE: Use this client for authenticated (session-aware) server-side calls.
 * For unauthenticated public reads use getSupabasePublic().
 * For admin/service-role operations use getSupabaseAdmin().
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[]) {
        try {
          for (const cookie of cookiesToSet) {
            cookieStore.set(cookie.name, cookie.value, cookie.options);
          }
        } catch {
          // setAll is called from a Server Component where cookies are read-only.
          // The proxy handles refreshing the session in those cases.
        }
      },
    },
  });
}
