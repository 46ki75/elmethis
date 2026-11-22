/// <reference types="vitest/config" />
import solid from "@solidjs/vite-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vite";

// Real-browser tests are reserved for native behavior, computed styles,
// layout, and Web APIs that happy-dom cannot model accurately.
export default defineConfig({
  plugins: [solid()],
  optimizeDeps: {
    include: ["@elmethis/ag-ui-stub"],
  },
  test: {
    name: "browser",
    include: ["src/**/*.browser.spec.tsx"],
    setupFiles: ["./vitest.browser.setup.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.spec.{ts,tsx}",
        "src/**/*.browser.spec.tsx",
        "src/**/*.ssr.spec.tsx",
        "src/**/*.stories.tsx",
        "src/index.ts",
      ],
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "coverage/browser",
    },
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: "chromium" }],
    },
  },
});
