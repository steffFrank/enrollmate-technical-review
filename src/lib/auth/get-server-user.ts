/*
 * IncluDO AI Platform
 * Copyright (c) 2026 Steff (steffFrank). All rights reserved.
 */
import "server-only";
import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

/**
 * Returns the currently authenticated user, or null if no session exists.
 *
 * Wrapped in React.cache() so the getUser() call is deduplicated across
 * multiple server components and actions within the same request — saving
 * repeated round-trips to Supabase Auth on every page render.
 *
 * Always uses getUser() (validates the JWT server-side) rather than
 * getSession() (trusts the client cookie blindly).
 */
export const getServerUser = cache(async (): Promise<User | null> => {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;
    return data.user;
  } catch {
    return null;
  }
});
