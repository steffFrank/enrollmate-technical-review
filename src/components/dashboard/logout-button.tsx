/*
 * IncluDO AI Platform
 * Copyright (c) 2026 Steff (steffFrank). All rights reserved.
 */
"use client";

import { LogOut } from "lucide-react";
import { useTransition } from "react";

type Props = { iconOnly?: boolean };

export function LogoutButton({ iconOnly }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      await fetch("/auth/logout", { method: "POST" });
      window.location.href = "/auth/login";
    });
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isPending}
      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
      title="Sign out"
      aria-label="Sign out"
    >
      <LogOut className="size-3.5 shrink-0" aria-hidden />
      {!iconOnly && "Sign out"}
    </button>
  );
}
