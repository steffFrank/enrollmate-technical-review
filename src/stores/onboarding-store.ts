"use client";

import { create } from "zustand";

export const ONBOARDING_STEPS = ["organization", "catalogue", "assistant"] as const;
export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

/** Client workflow state only; the Server Action owns validation and persistence. */
interface OnboardingState {
  currentStep: OnboardingStep;
  organizationName: string;
  slug: string;
  slugEdited: boolean;
  setStep: (step: OnboardingStep) => void;
  nextStep: () => void;
  previousStep: () => void;
  setOrganizationName: (name: string) => void;
  setSlug: (slug: string) => void;
  reset: () => void;
}

const initialState = {
  currentStep: "organization" as const,
  organizationName: "",
  slug: "",
  slugEdited: false,
};

export function organizationSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function adjacentStep(currentStep: OnboardingStep, direction: -1 | 1): OnboardingStep {
  const currentIndex = ONBOARDING_STEPS.indexOf(currentStep);
  const nextIndex = Math.min(
    ONBOARDING_STEPS.length - 1,
    Math.max(0, currentIndex + direction),
  );
  return ONBOARDING_STEPS[nextIndex] ?? currentStep;
}

export const useOnboardingStore = create<OnboardingState>()((set) => ({
  ...initialState,
  setStep: (currentStep) => set({ currentStep }),
  nextStep: () =>
    set((state) => ({ currentStep: adjacentStep(state.currentStep, 1) })),
  previousStep: () =>
    set((state) => ({ currentStep: adjacentStep(state.currentStep, -1) })),
  setOrganizationName: (organizationName) =>
    set((state) => ({
      organizationName,
      slug: state.slugEdited ? state.slug : organizationSlug(organizationName),
    })),
  setSlug: (value) =>
    set({
      slug: value.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 64),
      slugEdited: true,
    }),
  reset: () => set(initialState),
}));
