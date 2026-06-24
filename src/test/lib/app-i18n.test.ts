import { describe, expect, it } from "vitest";
import { APP_LOCALES, APP_UI } from "@/lib/app-i18n";
import { LANDING_COPY } from "@/lib/landing-i18n";

describe("app UI dictionary", () => {
  it("has localized profile and account-security copy for every supported locale", () => {
    const requiredKeys = [
      "authPrivacyAccept",
      "authConfirmEmail",
      "authConfirmEmailToastTitle",
      "authDismissNotification",
      "authCaptchaFailed",
      "authCurrentPassword",
      "passwordStrengthLabel",
      "passwordRuleUppercase",
      "passwordRuleSpecial",
      "profileTitle",
      "profileSecurityTitle",
      "profileNewEmail",
      "profileUpdatePassword",
    ] as const;

    for (const locale of APP_LOCALES) {
      for (const key of requiredKeys) {
        expect(APP_UI[key][locale].trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("has a localized self-service trial CTA on the landing page", () => {
    for (const locale of APP_LOCALES) {
      expect(LANDING_COPY[locale].trialCta.trim().length).toBeGreaterThan(0);
    }
  });
});
