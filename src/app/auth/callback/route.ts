/*
 * IncluDO AI Platform
 * Copyright (c) 2026 Steff (steffFrank). All rights reserved.
 *
 * Supabase Auth callback handler.
 * Exchanges the one-time `code` for a session (PKCE flow) or
 * handles the token_hash from magic-link emails.
 */
import { type NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { registerSession } from "@/lib/auth/session-registry";
import { getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

const SIGNUP_CONFIRMATION_REDIRECT = "/onboarding";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/dashboard";

  // Ensure `next` is a relative path to prevent open-redirect attacks.
  const redirectTo = next.startsWith("/") ? next : "/dashboard";

  const supabase = await createSupabaseServerClient();

  try {
    if (code) {
      // PKCE flow (OAuth or email OTP with code_verifier)
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (error || !data.session) {
        console.error("[auth/callback] code exchange failed:", error?.message);
        if (redirectTo === SIGNUP_CONFIRMATION_REDIRECT) {
          return NextResponse.redirect(new URL("/auth/login?confirmed=email", origin));
        }
        return NextResponse.redirect(new URL("/auth/login?error=auth_failed", origin));
      }

      // Register in our session registry for server-side revocation support.
      await registerSession({
        user: data.session.user,
        accessToken: data.session.access_token,
        userAgent: request.headers.get("user-agent"),
        ipAddress: getClientIp(request.headers),
      });

      return NextResponse.redirect(new URL(redirectTo, origin));
    }

    if (tokenHash && type) {
      // Magic-link / email verification flow
      const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: type as never });
      if (error || !data.session) {
        console.error("[auth/callback] OTP verify failed:", error?.message);
        return NextResponse.redirect(new URL("/auth/login?error=link_expired", origin));
      }

      await registerSession({
        user: data.session.user,
        accessToken: data.session.access_token,
        userAgent: request.headers.get("user-agent"),
        ipAddress: getClientIp(request.headers),
      });

      return NextResponse.redirect(new URL(redirectTo, origin));
    }
  } catch (err) {
    console.error("[auth/callback] unexpected error:", err);
  }

  return NextResponse.redirect(new URL("/auth/login?error=unknown", origin));
}
