/*
 * IncluDO AI Platform
 * Copyright (c) 2026 Steff (steffFrank). All rights reserved.
 */
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revokeSession } from "@/lib/auth/session-registry";
import { jsonOk } from "@/lib/http";

export const runtime = "nodejs";

export async function POST() {
  const supabase = await createSupabaseServerClient();
  const { data: sessionData } = await supabase.auth.getSession();
  const { data: userData } = await supabase.auth.getUser();

  if (userData.user && sessionData.session?.access_token) {
    await revokeSession({
      userId: userData.user.id,
      accessToken: sessionData.session.access_token,
    });
  }

  await supabase.auth.signOut();
  return jsonOk({ success: true });
}
