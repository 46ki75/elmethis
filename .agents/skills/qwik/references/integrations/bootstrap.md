# Integration: Bootstrap CSS

> Source: `packages/docs/src/routes/docs/integrations/bootstrap/index.mdx`

## Installation

```bash
pnpm run qwik add bootstrap
```

Installs `bootstrap@5` and `@types/bootstrap@5`.

## What gets created

| File | Purpose |
| ------ | --------- |
| `src/models/bootstrap.ts` | TypeScript models for Bootstrap component props |
| `src/constants/data.ts` | Demo constant data |
| `src/components/bootstrap/button.tsx` | Button component |
| `src/components/bootstrap/alert.tsx` | Alert component |
| `src/components/bootstrap/spinner.tsx` | Spinner component |
| `src/components/bootstrap/navbar.tsx` | Navbar (demonstrates JS without `document is not defined` errors) |
| `src/components/bootstrap/index.ts` | Barrel export |
| `src/routes/bootstrap/layout.tsx` | Layout with Bootstrap styles |
| `src/routes/bootstrap/index.tsx` | Demo homepage |
| `src/routes/bootstrap/buttons/index.tsx` | Button examples |
| `src/routes/bootstrap/alerts/index.tsx` | Alert examples |
| `src/routes/bootstrap/spinners/index.tsx` | Spinner examples |

## Key points

- After installation, visit `/bootstrap/` to see all examples.
- Bootstrap JavaScript features (navbar toggle, etc.) use `useVisibleTask$` to avoid SSR `document` errors.
- See [getbootstrap.com/docs/5.3](https://getbootstrap.com/docs/5.3/getting-started/introduction/) for full Bootstrap docs.
