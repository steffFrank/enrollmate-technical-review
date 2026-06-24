import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/test/**", "src/**/*.d.ts"],
    },
    alias: {
      "server-only": fileURLToPath(new URL("./src/test/__stubs__/server-only.ts", import.meta.url)),
    },
    server: {
      deps: { inline: ["@testing-library/jest-dom"] },
    },
  },
});
