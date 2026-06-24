/*
 * IncluDO AI Platform
 * Copyright (c) 2026 Steff (steffFrank). All rights reserved.
 */
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { jsonError, jsonOk } from "@/lib/http";

export const runtime = "nodejs";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) return jsonError("Not authenticated.", 401);

  return jsonOk({
    user: {
      id: data.user.id,
      email: data.user.email,
      fullName: (data.user.user_metadata as { full_name?: string | null }).full_name ?? null,
      preferredLanguage: (data.user.user_metadata as { preferred_language?: string | null }).preferred_language ?? null,
    },
  });
}
