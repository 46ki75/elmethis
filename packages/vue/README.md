# @elmethis/vue

Vue 3 component library for elmethis.

Components and hooks are being recreated to match the `@elmethis/qwik`
lead/base-reference implementation:

- design tokens come from `@elmethis/core` (`import "@elmethis/core/tokens.css"`);
- theming is native via CSS `light-dark()` + `color-scheme`;
- files are `kebab-case`, styles use CSS Modules with the `.elm-*` class
  convention, and specs are co-located.

## Authoring style

Components are authored in **TSX**, not single-file `.vue` components, to keep
the surface aligned with the `qwik`/`react` siblings and make porting from the
qwik reference mechanical. Each component is a `defineComponent` whose `setup`
returns a render function:

```tsx
import { defineComponent } from "vue";
import styles from "./elm-divider.module.css";

export const ElmDivider = defineComponent({
  name: "ElmDivider",
  inheritAttrs: false,
  setup(_, { attrs }) {
    return () => <hr class={styles["elm-divider"]} {...attrs} />;
  },
});
```

TSX is compiled by `@vitejs/plugin-vue-jsx`; types/`.d.ts` are emitted with
`vue-tsc`. Note Vue JSX is its own dialect (`class` not `className`, slots as
child functions, `v-model` is manual `modelValue` + `onUpdate:modelValue`).

## Scripts

| Script              | Purpose                                              |
| ------------------- | ---------------------------------------------------- |
| `pnpm dev`          | Storybook dev server (port 19231)                    |
| `pnpm build`        | Build the library (`vite build`) + types (`vue-tsc`) |
| `pnpm test:unit`    | Unit specs (happy-dom + Vue Test Utils, SSR)         |
| `pnpm test:browser` | Browser specs (real Chromium via Playwright)         |
| `pnpm lint`         | ESLint                                               |
| `pnpm lint:css`     | Stylelint                                            |
| `pnpm fmt`          | Prettier                                             |

## Testing layers

- `*.spec.ts(x)` → unit (`pnpm test:unit`): pure logic, CSR via Vue Test Utils,
  and SSR via `renderToString` from `vue/server-renderer`.
- `*.browser.spec.tsx` → browser (`pnpm test:browser`): real Chromium, only for
  behavior the unit DOM can't fake (native `<dialog>`/focus/layout, real Web
  APIs, `color-scheme`).
