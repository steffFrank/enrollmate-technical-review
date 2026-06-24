import { vi } from "vitest";

export type SupabaseResolver = {
  data?: unknown;
  error?: { message: string } | null;
  count?: number | null;
};

/**
 * Reusable chainable Supabase mock factory.
 *
 * Usage:
 *   const { db, mockFrom, mockRpc } = createSupabaseMock();
 *   vi.mocked(getSupabaseAdmin).mockReturnValue(db as never);
 *   mockFrom("organizations").resolvesOnce({ data: fakeOrg, error: null });
 */
export function createSupabaseMock() {
  const fromQueues = new Map<string, SupabaseResolver[]>();
  const rpcQueues = new Map<string, SupabaseResolver[]>();

  function dequeue(map: Map<string, SupabaseResolver[]>, key: string): SupabaseResolver {
    const queue = map.get(key) ?? [];
    return queue.shift() ?? { data: null, error: null, count: null };
  }

  function makeChain(table: string) {
    const resolve = () => Promise.resolve(dequeue(fromQueues, table));

    const chain: Record<string, unknown> = {};
    const methods = [
      "select", "insert", "update", "upsert", "delete",
      "eq", "neq", "in", "not", "order", "limit", "match",
    ];
    for (const m of methods) chain[m] = vi.fn(() => chain);

    chain["single"] = vi.fn(() => resolve());
    chain["maybeSingle"] = vi.fn(() => resolve());
    // Allow `await db.from(...).select(...).eq(...)` without explicit terminal
    chain["then"] = (onFulfilled: (v: unknown) => unknown) => resolve().then(onFulfilled);

    return chain;
  }

  const db = {
    from: vi.fn((table: string) => makeChain(table)),
    rpc: vi.fn((name: string) =>
      Promise.resolve(dequeue(rpcQueues, name))
    ),
  };

  return {
    db: db as unknown as ReturnType<typeof import("@/lib/supabase/admin").getSupabaseAdmin>,

    mockFrom(table: string) {
      if (!fromQueues.has(table)) fromQueues.set(table, []);
      return {
        resolvesOnce(resolver: SupabaseResolver) {
          fromQueues.get(table)!.push(resolver);
        },
      };
    },

    mockRpc(name: string) {
      if (!rpcQueues.has(name)) rpcQueues.set(name, []);
      return {
        resolvesOnce(resolver: SupabaseResolver) {
          rpcQueues.get(name)!.push(resolver);
        },
      };
    },

    reset() {
      fromQueues.clear();
      rpcQueues.clear();
      db.from.mockReset();
      db.rpc.mockReset();
      db.from.mockImplementation((table: string) => makeChain(table));
      db.rpc.mockImplementation((name: string) =>
        Promise.resolve(dequeue(rpcQueues, name))
      );
    },
  };
}
