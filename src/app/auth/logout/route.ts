/*
 * IncluDO AI Platform
 * Copyright (c) 2026 Steff (steffFrank). All rights reserved.
 *
 * POST /auth/logout — signs the user out and revokes the session.
 * Use a form POST (not a link) to get CSRF protection from the browser.
 */
import { type NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revokeSession } from "@/lib/auth/session-registry";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();

  const { data: sessionData } = await supabase.auth.getSession();
  const { data: userData } = await supabase.auth.getUser();

  // Revoke in DB registry before signing out so that in-flight requests fail fast.
  if (userData.user && sessionData.session?.access_token) {
    await revokeSession({
      userId: userData.user.id,
      accessToken: sessionData.session.access_token,
    });
  }

  await supabase.auth.signOut();

  const origin = new URL(request.url).origin;
  return NextResponse.redirect(new URL("/auth/login", origin), { status: 303 });
}
