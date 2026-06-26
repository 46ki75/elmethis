---
paths:
  - "packages/**/*.spec.ts"
  - "packages/**/*.spec.tsx"
  - "packages/**/*.browser.spec.tsx"
---

# Testing (two layers by file suffix)

Full guide: `TESTING.md`. Essentials:

- `*.spec.ts(x)` → **unit layer**: node + framework test-util (Qwik `createDOM`, React Testing
  Library, Vue Test Utils) and SSR. Config `vite.config.ts`. Run `pnpm run test.unit`.
- `*.browser.spec.tsx` → **browser layer**: real Chromium via Playwright. Config
  `vitest.browser.config.ts`. Run `pnpm run test.browser`.
- **Default to the unit layer.** Only reach for browser when the behavior genuinely needs a real
  browser (visible-task/effect firing, the real Qwik optimizer/QRLs, native `<dialog>.showModal()`,
  real Web APIs like clipboard/localStorage/matchMedia).
- The two configs are kept separate on purpose — `vitest-browser-qwik`'s SSR patching corrupts the
  unit layer's globals if merged.
- Specs co-locate next to source; same base name, `.browser` infix for the browser variant.
