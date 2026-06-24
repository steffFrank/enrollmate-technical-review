/*
 * IncluDO AI Platform
 * Copyright (c) 2026 Steff (steffFrank). All rights reserved.
 */
import "server-only";
import { createSupabaseServerClient } from "./server";
import type { SupabaseClient } from "@supabase/supabase-js";

export type ClientContext = "server";

export type ContextAwareClient = {
  supabase: SupabaseClient;
  context: ClientContext;
};

/**
 * Returns the appropriate Supabase client for the current server execution context.
 * All server actions and route handlers run on the server, so this always returns
 * a cookie-based server client with session-refresh capability.
 */
export async function getContextAwareClient(): Promise<ContextAwareClient> {
  const supabase = await createSupabaseServerClient();
  return { supabase, context: "server" };
}
