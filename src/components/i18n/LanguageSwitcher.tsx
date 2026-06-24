"use client";

import { Languages } from "lucide-react";
import { useAppLanguage } from "@/components/i18n/AppLanguageProvider";
import { APP_LOCALE_LABELS, APP_LOCALES } from "@/lib/app-i18n";

export function LanguageSwitcher({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  const { locale, setLocale, t } = useAppLanguage();

  return (
    <label className={`inline-flex items-center gap-1.5 text-muted-foreground ${className}`}>
      <Languages className="size-4 shrink-0" aria-hidden />
      <span className="sr-only">{t("language")}</span>
      <select
        value={locale}
        onChange={(event) => setLocale(event.target.value as typeof locale)}
        aria-label={t("language")}
        title={t("language")}
        className="h-9 rounded-lg border border-border bg-card px-2 text-xs font-semibold text-foreground shadow-sm outline-none transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring"
      >
        {APP_LOCALES.map((value) => (
          <option key={value} value={value}>
            {compact ? value.toUpperCase() : APP_LOCALE_LABELS[value]}
          </option>
        ))}
      </select>
    </label>
  );
}
