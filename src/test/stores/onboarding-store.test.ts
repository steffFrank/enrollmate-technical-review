import { beforeEach, describe, expect, it } from "vitest";
import { organizationSlug, useOnboardingStore } from "@/stores/onboarding-store";

describe("onboarding store", () => {
  beforeEach(() => useOnboardingStore.getState().reset());

  it("generates a slug until the user edits it", () => {
    const store = useOnboardingStore.getState();
    store.setOrganizationName("Acme Academy");
    expect(useOnboardingStore.getState().slug).toBe("acme-academy");

    store.setSlug("custom-url");
    store.setOrganizationName("Different Academy");
    expect(useOnboardingStore.getState().slug).toBe("custom-url");
  });

  it("normalizes organization slugs", () => {
    expect(organizationSlug("  École & Design  ")).toBe("cole-design");
  });

  it("moves through bounded named steps", () => {
    const store = useOnboardingStore.getState();
    store.previousStep();
    expect(useOnboardingStore.getState().currentStep).toBe("organization");

    store.nextStep();
    expect(useOnboardingStore.getState().currentStep).toBe("catalogue");
    useOnboardingStore.getState().nextStep();
    useOnboardingStore.getState().nextStep();
    expect(useOnboardingStore.getState().currentStep).toBe("assistant");
  });
});

