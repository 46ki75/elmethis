/// <reference types="vitest/config" />
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

// Real-browser tests are reserved for native behavior, computed styles,
// layout, and Web APIs that happy-dom cannot model accurately.
export default defineConfig({
  plugins: [solid()],
  optimizeDeps: {
    include: ["@elmethis/ag-ui-stub"],
  },
  test: {
    name: "browser",
    // Browser Mode replaces this environment at runtime; declaring it keeps
    // vite-plugin-solid from injecting its jsdom default during config merge.
    environment: "node",
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
      reportsDirectory: "coverage",
    },
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: "chromium" }],
    },
  },
});
