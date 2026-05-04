# Integration: Playwright

> Source: `packages/docs/src/routes/docs/integrations/playwright/index.mdx`

## Installation

```bash
pnpm run qwik add playwright
```

Adds:

- `playwright` dependency
- `test.e2e` script in `package.json`
- `playwright.config.ts` at project root
- `tests/example.spec.ts`

## Running tests

```bash
pnpm run test.e2e
# or directly:
pnpm playwright test tests/example.spec.ts --project chromium
```

## Key points

- Supports Chromium, Firefox, and WebKit (cross-platform).
- Works with all modern rendering engines.
- The Qwik monorepo uses Playwright for all E2E tests in `starters/e2e/`.
- Use `--project chromium` to run only Chromium tests locally (faster).
