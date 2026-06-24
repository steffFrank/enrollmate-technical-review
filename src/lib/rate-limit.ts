/*
 * IncluDO AI Platform
 * Copyright (c) 2026 Steff (steffFrank). All rights reserved.
 * Proprietary and confidential. Unauthorized use, copying, modification,
 * or distribution of this file is prohibited. See LICENSE.
 */
import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

/**
 * Supabase-backed sliding-window rate limiter.
 * Uses an atomic PL/pgSQL RPC so all Vercel instances share state.
 * Fails open: if the DB call throws, the request is allowed.
 * For >1000 rps, upgrade to Upstash Redis + @upstash/ratelimit.
 */

export interface RateLimitResult {
  allowed: boolean;
}

export async function rateLimit(
  key: string,
  limit: number,
  windowMs = 60_000,
): Promise<RateLimitResult> {
  try {
    const db = getSupabaseAdmin();
    const { data, error } = await db.rpc("check_rate_limit", {
      p_key: key,
      p_limit: limit,
      p_window_ms: windowMs,
    });

    if (error) {
      console.warn("rate-limit RPC error (failing open):", error.message);
      return { allowed: true };
    }

    return { allowed: Boolean(data) };
  } catch (err) {
    console.warn("rate-limit error (failing open):", err instanceof Error ? err.message : err);
    return { allowed: true };
  }
}

/** Best-effort client IP from standard proxy headers. */
export function getClientIp(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return headers.get("x-real-ip") ?? "unknown";
}
