/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";

// The `browser` layer: real Chromium via vitest-browser-react. This runs the
// real render path in an actual browser, so it catches behavior the happy-dom
// unit layer cannot fake (native `<dialog>`/focus/layout, `color-scheme`,
// `localStorage`/`StorageEvent`, real Web APIs).
//
// Kept separate from vite.config.ts on purpose: the browser provider and the
// happy-dom unit environment cannot share a single config.
export default defineConfig({
  plugins: [react()],
  test: {
    name: "browser",
    include: ["src/**/*.browser.spec.tsx"],
    setupFiles: ["./vitest.browser.setup.ts"],
    // Mirrors the unit-layer coverage (vite.config.ts). Uploaded under the
    // `react-browser` flag — Codecov merges it with the `react-unit` report
    // into one total, so no local lcov merge is needed.
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.spec.{ts,tsx}",
        "src/**/*.browser.spec.tsx",
        "src/**/*.stories.tsx",
        "src/index.ts",
      ],
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "coverage",
    },
    browser: {
      enabled: true,
      headless: true,
      // Grant clipboard permissions so `use-clipboard` can exercise the real
      // `navigator.clipboard` write/read path.
      provider: playwright({
        contextOptions: {
          permissions: ["clipboard-read", "clipboard-write"],
        },
      }),
      instances: [{ browser: "chromium" }],
    },
  },
});
