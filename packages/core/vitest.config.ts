/// <reference types="vitest/config" />
import { defineConfig } from "vitest/config";

// @elmethis/core is framework-agnostic and has a single unit layer (no browser
// specs), so coverage lives here rather than split across two configs like the
// SPA packages. Uploaded to Codecov under the `core` flag.
export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      // Pin the source set explicitly — without `include`, v8 only reports
      // files a test happened to import, so untested modules vanish from the
      // denominator. In Vitest 4, `include` makes uncovered files count at 0%.
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.spec.{ts,tsx}",
        "src/index.ts", // re-export barrel
        "src/**/*.css.ts", // vanilla-extract token output, built not unit-tested
      ],
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "coverage",
    },
  },
});
