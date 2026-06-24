/*
 * IncluDO AI Platform
 * Copyright (c) 2026 Steff (steffFrank). All rights reserved.
 */
"use client";

import { useEffect, useRef, useState } from "react";
import { useAppLanguage } from "@/components/i18n/AppLanguageProvider";

const TURNSTILE_SCRIPT_ID = "cloudflare-turnstile-script";
const TURNSTILE_ONLOAD_CALLBACK = "__courseAdvisorTurnstileOnload";
const TURNSTILE_SCRIPT_SRC = `https://challenges.cloudflare.com/turnstile/v0/api.js?onload=${TURNSTILE_ONLOAD_CALLBACK}&render=explicit`;

let turnstileScriptPromise: Promise<void> | null = null;

type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      callback?: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
      "timeout-callback"?: () => void;
      "refresh-expired"?: "auto" | "manual" | "never";
      retry?: "auto" | "never";
      theme?: "auto" | "light" | "dark";
    },
  ) => string;
  remove?: (widgetId: string) => void;
  reset?: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
    [TURNSTILE_ONLOAD_CALLBACK]?: () => void;
  }
}

function loadTurnstileScript(): Promise<void> {
  if (turnstileScriptPromise) return turnstileScriptPromise;

  turnstileScriptPromise = new Promise((resolve, reject) => {
    if (typeof window === "undefined") return resolve();
    if (window.turnstile) return resolve();

    window[TURNSTILE_ONLOAD_CALLBACK] = () => {
      resolve();
    };

    const existingScript = document.getElementById(TURNSTILE_SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener("error", () => reject(new Error("Turnstile script failed to load.")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = TURNSTILE_SCRIPT_ID;
    script.src = TURNSTILE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.addEventListener("error", () => reject(new Error("Turnstile script failed to load.")), { once: true });
    document.head.appendChild(script);
  });

  return turnstileScriptPromise;
}

export function TurnstileField({
  siteKey,
  resetSignal,
}: {
  siteKey?: string | null;
  resetSignal?: unknown;
}) {
  const { t } = useAppLanguage();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const resetSignalRef = useRef(resetSignal);
  const [token, setToken] = useState("");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!siteKey) return;
    let cancelled = false;

    loadTurnstileScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile || widgetIdRef.current) return;
        try {
          widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            theme: "auto",
            retry: "auto",
            "refresh-expired": "auto",
            callback: (nextToken) => {
              setFailed(false);
              setToken(nextToken);
            },
            "expired-callback": () => setToken(""),
            "timeout-callback": () => setToken(""),
            "error-callback": () => {
              console.warn("[Turnstile] Widget reported an error. Check the site key and allowed hostnames.");
              setToken("");
              setFailed(true);
            },
          });
        } catch (error) {
          console.warn("[Turnstile] Could not render widget.", error);
          setFailed(true);
        }
      })
      .catch((error) => {
        console.warn("[Turnstile] Could not load script.", error);
        setFailed(true);
      });

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile?.remove) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // Ignore cleanup errors from React strict-mode remounts.
        }
      }
      widgetIdRef.current = null;
    };
  }, [siteKey]);

  useEffect(() => {
    if (!siteKey || resetSignalRef.current === resetSignal) return;
    resetSignalRef.current = resetSignal;
    setToken("");
    if (widgetIdRef.current) window.turnstile?.reset?.(widgetIdRef.current);
  }, [resetSignal, siteKey]);

  if (!siteKey) return null;

  return (
    <div className="space-y-2">
      <input type="hidden" name="captchaToken" value={token} readOnly />
      <div ref={containerRef} className="min-h-[65px]" />
      {failed && (
        <p role="alert" className="text-xs text-destructive">
          {t("authCaptchaFailed")}
        </p>
      )}
    </div>
  );
}
