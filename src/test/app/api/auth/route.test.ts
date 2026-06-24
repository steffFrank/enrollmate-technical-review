import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/supabase/server", () => ({ createSupabaseServerClient: vi.fn() }));
vi.mock("@/lib/auth/session-registry", () => ({
  registerSession: vi.fn(),
  revokeSession: vi.fn(),
}));

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { registerSession, revokeSession } from "@/lib/auth/session-registry";
import { POST as registerPost } from "@/app/api/auth/register/route";
import { POST as loginPost } from "@/app/api/auth/login/route";
import { POST as logoutPost } from "@/app/api/auth/logout/route";
import { GET as meGet } from "@/app/api/auth/me/route";

const USER = {
  id: "user-1",
  email: "admin@example.com",
  user_metadata: { full_name: "Admin User", preferred_language: "en" },
};

function jsonRequest(path: string, body: unknown): NextRequest {
  return new NextRequest(`http://localhost${path}`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      "user-agent": "vitest",
      "x-forwarded-for": "127.0.0.1",
    },
  });
}

function mockAuth(overrides: Record<string, unknown>) {
  vi.mocked(createSupabaseServerClient).mockResolvedValue({
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      getSession: vi.fn(),
      getUser: vi.fn(),
      signOut: vi.fn(),
      ...overrides,
    },
  } as never);
}

beforeEach(() => {
  process.env.NEXT_PUBLIC_SELF_SERVICE_SIGNUP_ENABLED = "true";
  delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
});

describe("REST auth routes", () => {
  it("registers a user and records the session when email confirmation is not required", async () => {
    const signUp = vi.fn().mockResolvedValue({
      data: {
        user: USER,
        session: { user: USER, access_token: "access-token" },
      },
      error: null,
    });
    mockAuth({ signUp });

    const response = await registerPost(jsonRequest("/api/auth/register", {
      fullName: "Admin User",
      email: "admin@example.com",
      password: "Password123!",
      privacyAccepted: true,
    }));

    expect(response.status).toBe(201);
    expect(signUp).toHaveBeenCalledWith(expect.objectContaining({ email: "admin@example.com" }));
    expect(registerSession).toHaveBeenCalledWith(expect.objectContaining({ user: USER, accessToken: "access-token" }));
    await expect(response.json()).resolves.toMatchObject({ requiresEmailConfirmation: false, redirectTo: "/onboarding" });
  });

  it("rejects register when self-service signup is disabled", async () => {
    process.env.NEXT_PUBLIC_SELF_SERVICE_SIGNUP_ENABLED = "false";
    const response = await registerPost(jsonRequest("/api/auth/register", {
      email: "admin@example.com",
      password: "password123",
      privacyAccepted: true,
    }));
    expect(response.status).toBe(403);
  });

  it("logs in and returns a safe redirect", async () => {
    const signInWithPassword = vi.fn().mockResolvedValue({
      data: { session: { user: USER, access_token: "access-token" } },
      error: null,
    });
    mockAuth({ signInWithPassword });

    const response = await loginPost(jsonRequest("/api/auth/login", {
      email: "admin@example.com",
      password: "Password123!",
      next: "https://evil.example",
    }));

    expect(response.status).toBe(200);
    expect(registerSession).toHaveBeenCalledWith(expect.objectContaining({ accessToken: "access-token" }));
    await expect(response.json()).resolves.toMatchObject({ redirectTo: "/dashboard" });
  });

  it("requires a captcha token when Turnstile is enabled for login", async () => {
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "site-key";
    const signInWithPassword = vi.fn();
    mockAuth({ signInWithPassword });

    const response = await loginPost(jsonRequest("/api/auth/login", {
      email: "admin@example.com",
      password: "Password123!",
    }));

    expect(response.status).toBe(400);
    expect(signInWithPassword).not.toHaveBeenCalled();
  });

  it("returns the current authenticated user", async () => {
    mockAuth({
      getUser: vi.fn().mockResolvedValue({ data: { user: USER }, error: null }),
    });

    const response = await meGet();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      user: { id: "user-1", email: "admin@example.com", fullName: "Admin User", preferredLanguage: "en" },
    });
  });

  it("logs out and revokes the active session", async () => {
    const signOut = vi.fn().mockResolvedValue({ error: null });
    mockAuth({
      getSession: vi.fn().mockResolvedValue({ data: { session: { access_token: "access-token" } }, error: null }),
      getUser: vi.fn().mockResolvedValue({ data: { user: USER }, error: null }),
      signOut,
    });

    const response = await logoutPost();

    expect(response.status).toBe(200);
    expect(revokeSession).toHaveBeenCalledWith({ userId: "user-1", accessToken: "access-token" });
    expect(signOut).toHaveBeenCalled();
  });
});
