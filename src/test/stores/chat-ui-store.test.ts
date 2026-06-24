// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { useChatUiStore } from "@/stores/chat-ui-store";

describe("chat UI store", () => {
  beforeEach(() => {
    useChatUiStore.getState().reset();
    window.localStorage.clear();
  });

  it("keeps drafts isolated by organization scope", () => {
    const store = useChatUiStore.getState();
    store.setDraft("academy-a", "First draft");
    store.setDraft("academy-b", "Second draft");

    expect(useChatUiStore.getState().drafts).toEqual({
      "academy-a": "First draft",
      "academy-b": "Second draft",
    });
  });

  it("appends transcripts and clears only the selected draft", () => {
    const store = useChatUiStore.getState();
    store.setDraft("academy-a", "Existing");
    store.appendToDraft("academy-a", "transcript");
    store.setDraft("academy-b", "Keep me");
    store.clearDraft("academy-a");

    expect(useChatUiStore.getState().drafts).toEqual({ "academy-b": "Keep me" });
  });

  it("persists and hydrates a supported language", () => {
    useChatUiStore.getState().setLanguage("fr");
    expect(window.localStorage.getItem("enrollmate_locale")).toBe("fr");

    useChatUiStore.setState({ language: "it" });
    useChatUiStore.getState().hydrateLanguage();
    expect(useChatUiStore.getState().language).toBe("fr");
  });

  it("hydrates a supported language from the legacy CourseAdvisor key", () => {
    window.localStorage.setItem("courseadvisor_locale", "en");

    useChatUiStore.setState({ language: "it" });
    useChatUiStore.getState().hydrateLanguage();

    expect(useChatUiStore.getState().language).toBe("en");
  });

  it("resets transient request and microphone state together", () => {
    const store = useChatUiStore.getState();
    store.setThinking(true);
    store.setStreaming(true);
    store.setVoiceState("recording");
    store.resetTransientState();

    expect(useChatUiStore.getState()).toMatchObject({
      isThinking: false,
      isStreaming: false,
      voiceState: "idle",
    });
  });
});

