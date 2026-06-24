/*
 * IncluDO AI Platform
 * Copyright (c) 2026 Steff (steffFrank). All rights reserved.
 */
"use client";

import { Moon, Sun } from "lucide-react";
import { useAppLanguage } from "@/components/i18n/AppLanguageProvider";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { t } = useAppLanguage();
  function toggleTheme() {
    const root = document.documentElement;
    const dark = !root.classList.contains("dark");
    root.classList.toggle("dark", dark);
    root.style.colorScheme = dark ? "dark" : "light";
    window.localStorage.setItem("enrollmate:theme", dark ? "dark" : "light");
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={[
        "inline-flex size-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      ].join(" ")}
      aria-label={t("theme")}
      title={t("theme")}
    >
      <Moon className="size-4 dark:hidden" aria-hidden />
      <Sun className="hidden size-4 dark:block" aria-hidden />
    </button>
  );
}
