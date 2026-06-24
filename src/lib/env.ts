/*
 * IncluDO AI Platform
 * Copyright (c) 2026 Steff (steffFrank). All rights reserved.
 * Proprietary and confidential. Unauthorized use, copying, modification,
 * or distribution of this file is prohibited. See LICENSE.
 */
import "server-only";
import { z } from "zod";

/**
 * Server-only environment validation.
 * Importing this module from a Client Component will fail the build
 * (thanks to `server-only`), guaranteeing secrets never reach the browser.
 */
const serverEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  GEMINI_API_KEY: z.string().min(1),
  GEMINI_CHAT_MODEL: z.string().default("gemini-2.5-flash"),

  OPENAI_API_KEY: z.string().min(1),
  OPENAI_EMBEDDING_MODEL: z.string().default("text-embedding-3-small"),
  OPENAI_TRANSCRIBE_MODEL: z.string().default("whisper-1"),

  CHAT_RATE_LIMIT_PER_MINUTE: z.coerce.number().int().positive().default(15),
  CHAT_MAX_MESSAGES_PER_SESSION: z.coerce.number().int().positive().default(50),
  USAGE_DASHBOARD_TOKEN: z.string().optional(),

  // Phase 2: Auth — used for OAuth callbacks and magic-link emails.
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_SELF_SERVICE_SIGNUP_ENABLED: z.string().optional(),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().min(1).optional(),

  // Phase 3: Billing — Stripe
  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1).optional(),
  STRIPE_STARTER_PRICE_ID: z.string().min(1).optional(),
  STRIPE_PRO_PRICE_ID: z.string().min(1).optional(),

  // Concierge integrations and managed-pilot sales routing.
  INTEGRATION_ENCRYPTION_KEY: z.string().min(32).optional(),
  CRON_SECRET: z.string().min(16).optional(),
  SALES_CONTACT_URL: z.string().url().optional(),

  // Phase 3: Email — Resend
  RESEND_API_KEY: z.string().min(1).optional(),
  EMAIL_FROM: z.string().email().default("noreply@enrollmate.ai"),
});

let cached: z.infer<typeof serverEnvSchema> | null = null;

export function getServerEnv() {
  if (cached) return cached;
  const parsed = serverEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    // Do not leak values — only the names of the offending keys.
    const missing = parsed.error.issues.map((i) => i.path.join(".")).join(", ");
    throw new Error(`Invalid or missing environment variables: ${missing}`);
  }
  cached = parsed.data;
  return cached;
}

/** Embedding dimension MUST match the pgvector column (vector(1536)). */
export const EMBEDDING_DIMENSION = 1536;
