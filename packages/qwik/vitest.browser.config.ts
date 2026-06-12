import { defineConfig } from "vite";
import { qwikVite } from "@qwik.dev/core/optimizer";
import tsconfigPaths from "vite-tsconfig-paths";
import { testSSR } from "vitest-browser-qwik/ssr-plugin";
import { playwright } from "@vitest/browser-playwright";

// The `browser` layer: real Chromium via vitest-browser-qwik — render() (CSR)
// and renderSSR() (SSR). This runs the real Qwik optimizer, so it catches
// bugs createDOM cannot (e.g. QRL handlers that fail to resolve).
//
// Kept separate from vite.config.ts on purpose: `testSSR()` patches global SSR
// state the instant it is invoked, which corrupts the node project's
// createDOM/localStorage globals if both configs are loaded together.
export default defineConfig({
  plugins: [
    // `testSSR()` must precede `qwikVite()` per the plugin's docs.
    testSSR(),
    // The Alt+click-to-source dev overlay intercepts pointer events and breaks
    // Playwright's actionability checks — turn it off here.
    qwikVite({ devTools: { clickToSource: false } }),
    tsconfigPaths({ root: "." }),
  ],
  test: {
    name: "browser",
    include: ["src/**/*.browser.spec.tsx"],
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: "chromium" }],
    },
  },
});
