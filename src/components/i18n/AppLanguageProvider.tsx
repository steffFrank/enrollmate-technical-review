"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  APP_LOCALE_COOKIE,
  APP_UI,
  type AppLocale,
  type AppTranslationKey,
} from "@/lib/app-i18n";

type AppLanguageContextValue = {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  t: (key: AppTranslationKey) => string;
};

const AppLanguageContext = createContext<AppLanguageContextValue | null>(null);

export function AppLanguageProvider({ locale, children }: { locale: AppLocale; children: ReactNode }) {
  const router = useRouter();
  const setLocale = useCallback((nextLocale: AppLocale) => {
    document.cookie = `${APP_LOCALE_COOKIE}=${nextLocale}; Path=/; Max-Age=31536000; SameSite=Lax`;
    window.localStorage.setItem(APP_LOCALE_COOKIE, nextLocale);
    document.documentElement.lang = nextLocale;
    router.refresh();
  }, [router]);

  const value = useMemo<AppLanguageContextValue>(() => ({
    locale,
    setLocale,
    t: (key) => APP_UI[key][locale],
  }), [locale, setLocale]);

  return <AppLanguageContext.Provider value={value}>{children}</AppLanguageContext.Provider>;
}

export function useAppLanguage() {
  const value = useContext(AppLanguageContext);
  if (!value) throw new Error("useAppLanguage must be used within AppLanguageProvider");
  return value;
}
