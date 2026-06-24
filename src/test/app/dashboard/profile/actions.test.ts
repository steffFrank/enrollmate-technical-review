import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/actions/action", () => ({ action: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { action } from "@/lib/actions/action";
import { updateUserEmailAction, updateUserPasswordAction } from "@/app/dashboard/profile/actions";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("profile actions", () => {
  it("treats submitting the current email as a no-op success", async () => {
    const updateUser = vi.fn();
    vi.mocked(action).mockResolvedValueOnce({
      success: true,
      data: {
        user: { email: "admin@example.com" },
        params: { email: "ADMIN@example.com" },
        supabase: { auth: { updateUser } },
        metadata: { executionId: "test", timestamp: new Date(), context: "server" },
      },
    } as never);

    const formData = new FormData();
    formData.set("email", "ADMIN@example.com");

    await expect(updateUserEmailAction(null, formData)).resolves.toEqual({
      successKey: "profileEmailUnchanged",
    });
    expect(updateUser).not.toHaveBeenCalled();
  });

  it("passes an email redirect URL to Supabase for real email changes", async () => {
    const updateUser = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(action).mockResolvedValueOnce({
      success: true,
      data: {
        user: { email: "old@example.com" },
        params: { email: "new@example.com" },
        supabase: { auth: { updateUser } },
        metadata: { executionId: "test", timestamp: new Date(), context: "server" },
      },
    } as never);

    const formData = new FormData();
    formData.set("email", "new@example.com");

    await expect(updateUserEmailAction(null, formData)).resolves.toEqual({
      successKey: "profileEmailUpdated",
    });
    expect(updateUser).toHaveBeenCalledWith(
      { email: "new@example.com" },
      { emailRedirectTo: "http://localhost:3000/auth/callback?next=/dashboard/profile" },
    );
  });

  it("shows a specific message when Supabase rejects reusing the current password", async () => {
    const updateUser = vi.fn().mockResolvedValue({
      error: { message: "New password should be different from the old password." },
    });
    vi.mocked(action).mockResolvedValueOnce({
      success: true,
      data: {
        user: { email: "admin@example.com" },
        params: { currentPassword: "OldPassword123!", password: "Password123!", confirmPassword: "Password123!" },
        supabase: { auth: { updateUser } },
        metadata: { executionId: "test", timestamp: new Date(), context: "server" },
      },
    } as never);

    const formData = new FormData();
    formData.set("currentPassword", "OldPassword123!");
    formData.set("password", "Password123!");
    formData.set("confirmPassword", "Password123!");

    await expect(updateUserPasswordAction(null, formData)).resolves.toEqual({
      error: "Choose a new password that is different from your current password.",
    });
  });

  it("shows a sign-in message when the password update session is missing", async () => {
    const updateUser = vi.fn().mockResolvedValue({
      error: { name: "AuthSessionMissingError", message: "Auth session missing!" },
    });
    vi.mocked(action).mockResolvedValueOnce({
      success: true,
      data: {
        user: { email: "admin@example.com" },
        params: { currentPassword: "OldPassword123!", password: "Password123!", confirmPassword: "Password123!" },
        supabase: { auth: { updateUser } },
        metadata: { executionId: "test", timestamp: new Date(), context: "server" },
      },
    } as never);

    const formData = new FormData();
    formData.set("currentPassword", "OldPassword123!");
    formData.set("password", "Password123!");
    formData.set("confirmPassword", "Password123!");

    await expect(updateUserPasswordAction(null, formData)).resolves.toEqual({
      error: "Your session expired. Sign in again before changing your password.",
    });
  });

  it("updates the password when Supabase accepts the new value", async () => {
    const updateUser = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(action).mockResolvedValueOnce({
      success: true,
      data: {
        user: { email: "admin@example.com" },
        params: { currentPassword: "OldPassword123!", password: "Password123!", confirmPassword: "Password123!" },
        supabase: { auth: { updateUser } },
        metadata: { executionId: "test", timestamp: new Date(), context: "server" },
      },
    } as never);

    const formData = new FormData();
    formData.set("currentPassword", "OldPassword123!");
    formData.set("password", "Password123!");
    formData.set("confirmPassword", "Password123!");

    await expect(updateUserPasswordAction(null, formData)).resolves.toEqual({
      successKey: "profilePasswordUpdated",
    });
    expect(updateUser).toHaveBeenCalledWith({
      current_password: "OldPassword123!",
      password: "Password123!",
    });
  });

  it("shows a specific message when the current password is wrong", async () => {
    const updateUser = vi.fn().mockResolvedValue({
      error: { message: "Invalid current password." },
    });
    vi.mocked(action).mockResolvedValueOnce({
      success: true,
      data: {
        user: { email: "admin@example.com" },
        params: { currentPassword: "WrongPassword123!", password: "Password123!", confirmPassword: "Password123!" },
        supabase: { auth: { updateUser } },
        metadata: { executionId: "test", timestamp: new Date(), context: "server" },
      },
    } as never);

    const formData = new FormData();
    formData.set("currentPassword", "WrongPassword123!");
    formData.set("password", "Password123!");
    formData.set("confirmPassword", "Password123!");

    await expect(updateUserPasswordAction(null, formData)).resolves.toEqual({
      error: "The current password is incorrect.",
    });
  });
});
