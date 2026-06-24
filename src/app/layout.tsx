/*
 * IncluDO AI Platform
 * Copyright (c) 2026 Steff (steffFrank). All rights reserved.
 * Proprietary and confidential. Unauthorized use, copying, modification,
 * or distribution of this file is prohibited. See LICENSE.
 */
import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { AppLanguageProvider } from "@/components/i18n/AppLanguageProvider";
import { getAppLocale } from "@/lib/app-i18n.server";

export const metadata: Metadata = {
  title: "EnrollMate",
  description:
    "AI-powered course guidance for training organisations and their students.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

const themeScript =
  '(function(){try{var saved=localStorage.getItem("enrollmate:theme")||localStorage.getItem("courseadvisor:theme");var dark=saved==="dark"||(!saved&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",dark);document.documentElement.style.colorScheme=dark?"dark":"light";}catch(_){}})();';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getAppLocale();
  return (
    <html
      lang={locale}
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh bg-background font-sans text-foreground antialiased transition-colors">
        <AppLanguageProvider locale={locale}>{children}</AppLanguageProvider>
      </body>
    </html>
  );
}
