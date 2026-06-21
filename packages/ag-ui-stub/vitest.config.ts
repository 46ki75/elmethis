/// <reference types="vitest/config" />
import { defineConfig } from "vitest/config";

// Single Node unit layer (no browser specs). Coverage is uploaded to Codecov
// under the `ag-ui-stub` flag.
export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      // Pin the source set explicitly so untested modules count at 0% rather
      // than vanishing from the denominator (Vitest 4 + v8 behavior).
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.spec.{ts,tsx}",
        "src/index.ts", // re-export barrel
        "src/test-support.ts", // test helpers
        "src/server.ts", // Hono entrypoint — exercised at runtime, not in unit specs
      ],
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "coverage",
    },
  },
});
