"use client";

import { useAppLanguage } from "@/components/i18n/AppLanguageProvider";
import { DASHBOARD_COPY } from "@/lib/dashboard-i18n";

export function useDashboardCopy() {
  const { locale } = useAppLanguage();
  return DASHBOARD_COPY[locale];
}
