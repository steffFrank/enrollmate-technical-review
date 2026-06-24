import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/supabase/server", () => ({ createSupabaseServerClient: vi.fn() }));
vi.mock("@/lib/auth/session-registry", () => ({ registerSession: vi.fn() }));

import { GET } from "@/app/auth/callback/route";
import { registerSession } from "@/lib/auth/session-registry";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function callbackRequest(path: string): NextRequest {
  return new NextRequest(`http://localhost${path}`, {
    headers: {
      "user-agent": "vitest",
      "x-forwarded-for": "127.0.0.1",
    },
  });
}

function mockAuth(overrides: Record<string, unknown>) {
  vi.mocked(createSupabaseServerClient).mockResolvedValue({
    auth: {
      exchangeCodeForSession: vi.fn(),
      verifyOtp: vi.fn(),
      ...overrides,
    },
  } as never);
}

describe("auth callback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends failed signup confirmations to login with a success notice", async () => {
    mockAuth({
      exchangeCodeForSession: vi.fn().mockResolvedValue({
        data: { session: null },
        error: new Error("invalid request: both auth code and code verifier should be non-empty"),
      }),
    });

    const response = await GET(callbackRequest("/auth/callback?code=auth-code&next=/onboarding"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/auth/login?confirmed=email");
    expect(registerSession).not.toHaveBeenCalled();
  });

  it("keeps non-signup code exchange failures as authentication errors", async () => {
    mockAuth({
      exchangeCodeForSession: vi.fn().mockResolvedValue({
        data: { session: null },
        error: new Error("bad code"),
      }),
    });

    const response = await GET(callbackRequest("/auth/callback?code=auth-code&next=/dashboard"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/auth/login?error=auth_failed");
  });
});
