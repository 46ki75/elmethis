## Building with @elmethis/react

Compose the real components below and style with the design tokens. This is a
**token + component-prop** system — there are NO utility CSS classes (styles are
scoped CSS Modules baked into the components). Don't invent class names; you
won't have any to use.

### Theme & setup — no provider needed

Theming is native: every themed token is a CSS `light-dark()` value resolved
against the page's `color-scheme`. By default it follows the OS. Components work
standalone — **do not wrap them in a provider** (there isn't one).

- To force a theme, set `color-scheme: light` (or `dark`) on a root element, or
  call the `useElmethisTheme()` hook → `{ isDarkTheme, toggleTheme }` (it pins
  `color-scheme` on `<html>`). `ElmToggleTheme` is a ready-made toggle button.
- `styles.css` already `@import`s the tokens, fonts, and component CSS — link it
  once (see Loading below). Text inherits a sans-serif body font from it.

### Style with `var(--elmethis-*)` tokens — never hardcode hex

Tokens are `light-dark()` values, so they re-theme automatically; a raw hex
color will not. Use them for any layout glue you write around the components:

- **Surfaces:** `--elmethis-color-surface-base`, `-surface-raised`, `-surface-sunken`
- **Text:** `--elmethis-color-neutral` (body), `-neutral-strong`, `-neutral-weak`
- **Brand:** `--elmethis-color-primary`, `-primary-hover`, `-primary-strong`, `-primary-weak`
- **Accents** (each has a matching `-surface`): `--elmethis-color-accent-info`,
  `-accent-success`, `-accent-warning`, `-accent-error`, `-accent-important`, `-accent-link`
- **Display palette** (each has `-surface`): `--elmethis-color-display-{blue,cyan,green,yellow,orange,red,magenta,purple}`
- **Monospace:** `--elmethis-font-family-monospace`

(`--elmethis-scoped-*` and `--elmethis-primitive-*` are component-internal / raw
values — don't author against them. The full list is in `styles.css`.)

### Style via component props, not CSS

Variant flags are bare booleans; runtime-state flags use `is`/`has`; values are
bare nouns. Examples from the real APIs:

- `<ElmButton primary block isLoading color="...">` — `primary`/`block` are variants, `isLoading` is state.
- `<ElmInlineText bold italic code kbd underline strikethrough color="..." />` — presentational flags.
- `<ElmCallout type="note|tip|important|warning|caution">` — bare variant value.
- `<ElmHeading level={2} text="..." />`, `<ElmList>`, `<ElmParagraph>`, `<ElmTable>` for content.

Read `components/<group>/<Name>/<Name>.prompt.md` (usage + variants) and
`<Name>.d.ts` (full prop types) before composing a component you haven't used.

### Idiomatic example

```jsx
const { ElmCallout, ElmHeading, ElmParagraph, ElmButton } = window.ElmethisReact;

<section style={{
  background: "var(--elmethis-color-surface-raised)",
  color: "var(--elmethis-color-neutral)",
  padding: "1.5rem", borderRadius: "0.25rem",
}}>
  <ElmHeading level={2} text="Deploy preview" />
  <ElmParagraph>Your build finished. Review it before promoting.</ElmParagraph>
  <ElmCallout type="tip">Promoting is reversible for 24h.</ElmCallout>
  <ElmButton primary>Promote</ElmButton>
</section>
```

Components carry their own styling; your glue only needs layout + tokens.
