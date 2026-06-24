import "@testing-library/jest-dom";
import { vi, afterEach } from "vitest";

// next/server: mock `after()` — runs callback immediately as a microtask
vi.mock("next/server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/server")>();
  return {
    ...actual,
    after: vi.fn((fn: () => unknown) => {
      void Promise.resolve().then(fn);
    }),
  };
});

// Set test env vars before any module loads (prevents getServerEnv() from throwing)
process.env["NEXT_PUBLIC_SUPABASE_URL"] = "https://test.supabase.co";
process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"] = "test-anon-key";
process.env["SUPABASE_SERVICE_ROLE_KEY"] = "test-service-role-key";
process.env["GEMINI_API_KEY"] = "test-gemini-key";
process.env["GEMINI_CHAT_MODEL"] = "gemini-2.0-flash";
process.env["OPENAI_API_KEY"] = "test-openai-key";
process.env["OPENAI_EMBEDDING_MODEL"] = "text-embedding-3-small";
process.env["OPENAI_TRANSCRIBE_MODEL"] = "whisper-1";
process.env["CHAT_RATE_LIMIT_PER_MINUTE"] = "15";
process.env["CHAT_MAX_MESSAGES_PER_SESSION"] = "50";

afterEach(() => {
  vi.clearAllMocks();
});
