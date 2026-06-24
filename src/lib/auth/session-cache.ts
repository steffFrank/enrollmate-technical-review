/*
 * IncluDO AI Platform
 * Copyright (c) 2026 Steff (steffFrank). All rights reserved.
 */

/**
 * In-memory validation cache for user sessions.
 * Skips the DB round-trip on every action if the session was recently validated.
 * Works per-process; compatible with serverless (short-lived) and long-lived servers.
 */

const CACHE_TTL_MS = 60_000; // 1 minute — safe window before re-validating
const PRUNE_EVERY = 200;     // prune dead entries every N writes to cap memory

type CacheEntry = { validatedAt: number };

const cache = new Map<string, CacheEntry>();
let writeCount = 0;

/** Returns true if this session key was successfully validated within the TTL window. */
export function hasRecentSessionValidation(cacheKey: string): boolean {
  const entry = cache.get(cacheKey);
  if (!entry) return false;
  return Date.now() - entry.validatedAt < CACHE_TTL_MS;
}

/** Records a successful session validation, allowing future calls to skip the DB. */
export function rememberSessionValidation(cacheKey: string): void {
  cache.set(cacheKey, { validatedAt: Date.now() });
  writeCount++;

  if (writeCount % PRUNE_EVERY === 0) {
    pruneExpiredEntries();
  }
}

/** Immediately invalidates a session from the cache (e.g., on logout/revocation). */
export function invalidateSessionCache(cacheKey: string): void {
  cache.delete(cacheKey);
}

function pruneExpiredEntries(): void {
  const cutoff = Date.now() - CACHE_TTL_MS;
  for (const [key, entry] of cache) {
    if (entry.validatedAt < cutoff) {
      cache.delete(key);
    }
  }
}
