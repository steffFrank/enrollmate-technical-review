/*
 * IncluDO AI Platform
 * Copyright (c) 2026 Steff (steffFrank). All rights reserved.
 */

/**
 * Extracts the session_id from a Supabase access token without a full JWT
 * library. Supabase JWTs include a `session_id` claim (UUID) in the payload.
 * Falls back to `jti` if `session_id` is absent.
 */
export function getSessionIdFromAccessToken(accessToken: string): string | null {
  try {
    const parts = accessToken.split(".");
    if (parts.length < 2 || !parts[1]) return null;

    // atob works in both Node 20+ and Edge runtimes.
    const padded = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = Buffer.from(padded, "base64").toString("utf-8");
    const payload = JSON.parse(json) as Record<string, unknown>;

    const sessionId = payload["session_id"] ?? payload["jti"];
    return typeof sessionId === "string" && sessionId.length > 0 ? sessionId : null;
  } catch {
    return null;
  }
}

/** SHA-256 hex of a string — used as a fallback lookup key for access tokens. */
export async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await globalThis.crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
