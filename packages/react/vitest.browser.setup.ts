// Browser-layer setup (vitest.browser.config.ts `test.setupFiles`).
//
// Unmount rendered trees and clear their containers from `document.body`
// after every test. The browser suite shares one real page across all specs,
// so without this, `document.querySelector(...)` lookups can hit stale nodes
// left by earlier tests. Mirrors the unit layer's cleanup in `vitest.setup.ts`.
import { cleanup } from "vitest-browser-react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});
