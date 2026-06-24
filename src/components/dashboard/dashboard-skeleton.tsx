/*
 * IncluDO AI Platform
 * Copyright (c) 2026 Steff (steffFrank). All rights reserved.
 */
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardLoadingSkeleton() {
  return (
    <div className="flex h-dvh overflow-hidden bg-background text-foreground">
      <aside className="hidden w-56 shrink-0 border-r border-border bg-card p-4 md:block">
        <Skeleton className="h-7 w-36" />
        <div className="mt-8 space-y-3">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-11/12 rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-10/12 rounded-lg" />
          <Skeleton className="h-10 w-11/12 rounded-lg" />
        </div>
        <div className="mt-auto pt-48">
          <Skeleton className="h-9 w-full rounded-lg" />
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-border bg-card px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-7 w-64" />
            </div>
            <Skeleton className="h-9 w-28 rounded-lg" />
          </div>
        </header>

        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="mt-4 h-8 w-20" />
                <Skeleton className="mt-3 h-3 w-32" />
              </div>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <Skeleton className="h-5 w-44" />
              <div className="mt-5 space-y-3">
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-11/12 rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            </section>

            <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <Skeleton className="h-5 w-36" />
              <div className="mt-5 space-y-4">
                <Skeleton className="h-24 w-full rounded-lg" />
                <Skeleton className="h-24 w-full rounded-lg" />
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
