/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import { qwikVite } from "@qwik.dev/core/optimizer";
import tsconfigPaths from "vite-tsconfig-paths";
import { playwright } from "@vitest/browser-playwright";

// The `browser` layer: real Chromium via vitest-browser-qwik — render() (CSR).
// This runs the real Qwik optimizer, so it catches bugs createDOM cannot
// (e.g. QRL handlers that fail to resolve).
//
// SSR is intentionally NOT wired in here. `renderSSR()` (and its `testSSR()`
// plugin) spins up a Vite SSR module runner that leaks file handles at
// teardown, hanging the pool close for ~10s. SSR is covered in the unit layer
// via `renderToString` instead.
export default defineConfig({
  plugins: [
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
      // Grant clipboard permissions so `use-clipboard` can exercise the real
      // `navigator.clipboard` write/read path (createDOM can only mock it).
      provider: playwright({
        contextOptions: {
          permissions: ["clipboard-read", "clipboard-write"],
        },
      }),
      instances: [{ browser: "chromium" }],
    },
  },
});
