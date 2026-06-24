"use client";

import { create } from "zustand";
import type { UILanguage } from "@/lib/i18n";

export type VoiceState = "idle" | "recording" | "transcribing";

const LANGUAGE_STORAGE_KEY = "enrollmate_locale";
const LEGACY_LANGUAGE_STORAGE_KEYS = ["courseadvisor_locale", "includo:language"] as const;
const SUPPORTED_LANGUAGES: readonly UILanguage[] = ["it", "en", "fr"];

/**
 * Ephemeral client UI state only. Messages, conversations, and API data remain
 * server-backed. Drafts intentionally stay in memory; only language is persisted.
 */
interface ChatUiState {
  language: UILanguage;
  drafts: Record<string, string>;
  voiceState: VoiceState;
  isThinking: boolean;
  isStreaming: boolean;
  hydrateLanguage: () => void;
  setLanguage: (language: UILanguage) => void;
  setDraft: (scope: string, draft: string) => void;
  appendToDraft: (scope: string, text: string) => void;
  clearDraft: (scope: string) => void;
  setVoiceState: (voiceState: VoiceState) => void;
  setThinking: (isThinking: boolean) => void;
  setStreaming: (isStreaming: boolean) => void;
  resetTransientState: () => void;
  reset: () => void;
}

const transientState = {
  voiceState: "idle" as const,
  isThinking: false,
  isStreaming: false,
};

function isSupportedLanguage(value: string | null): value is UILanguage {
  return value !== null && SUPPORTED_LANGUAGES.includes(value as UILanguage);
}

export const useChatUiStore = create<ChatUiState>()((set) => ({
  language: "it",
  drafts: {},
  ...transientState,

  hydrateLanguage: () => {
    if (typeof window === "undefined") return;
    const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
      ?? LEGACY_LANGUAGE_STORAGE_KEYS.map((key) => window.localStorage.getItem(key)).find(Boolean)
      ?? null;
    if (isSupportedLanguage(savedLanguage)) set({ language: savedLanguage });
  },

  setLanguage: (language) => {
    set({ language });
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
      document.cookie = `${LANGUAGE_STORAGE_KEY}=${language}; Path=/; Max-Age=31536000; SameSite=Lax`;
    }
  },

  setDraft: (scope, draft) =>
    set((state) => ({ drafts: { ...state.drafts, [scope]: draft } })),

  appendToDraft: (scope, text) =>
    set((state) => {
      const currentDraft = state.drafts[scope] ?? "";
      return {
        drafts: {
          ...state.drafts,
          [scope]: currentDraft ? `${currentDraft} ${text}` : text,
        },
      };
    }),

  clearDraft: (scope) =>
    set((state) => {
      const drafts = { ...state.drafts };
      delete drafts[scope];
      return { drafts };
    }),

  setVoiceState: (voiceState) => set({ voiceState }),
  setThinking: (isThinking) => set({ isThinking }),
  setStreaming: (isStreaming) => set({ isStreaming }),
  resetTransientState: () => set(transientState),
  reset: () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(LANGUAGE_STORAGE_KEY);
      for (const key of LEGACY_LANGUAGE_STORAGE_KEYS) {
        window.localStorage.removeItem(key);
      }
    }
    set({ language: "it", drafts: {}, ...transientState });
  },
}));
