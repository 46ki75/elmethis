# Cookbook: Fonts

> Source: `packages/docs/src/routes/docs/cookbook/fonts/index.mdx`

## Performance concepts

| Term | Meaning |
| ------ | --------- |
| **FOIT** | Flash Of Invisible Text — text hidden until font loads |
| **FOUT** | Flash Of Unstyled Text — system font shown, then swapped |
| `font-display: swap` | Show fallback immediately, swap when custom font is ready |
| `font-display: fallback` | Short block period, then swap if font loads within 3 s |

## Options

### 1. Google Fonts (simplest, but slower)

Two cross-origin requests slow initial load. Prefer self-hosting.

### 2. Fontsource (self-hosted, npm)

```bash
pnpm install @fontsource/inter
```

Follow the [Qwik City guide on fontsource.org](https://fontsource.org/docs/guides/qwik).

### 3. Manual self-hosting

Convert `ttf`/`otf` → `woff2` with [Fontsquirrel Webfont Generator](https://www.fontsquirrel.com/tools/webfont-generator), then declare `@font-face`:

```css
@font-face {
  font-display: swap;
  font-family: 'My Font';
  font-style: normal;
  font-weight: 400;
  src: url('../assets/fonts/my-font.woff2') format('woff2');
}
```

### 4. System font stacks (most performant)

No download required. Tailwind CSS provides `font-sans`, `font-serif`, `font-mono`.

## Fallback font matching (reduce CLS)

Use [screenspan.net/fallback](https://screenspan.net/fallback) or the
[Fontaine Vite plugin](https://github.com/unjs/fontaine) to auto-generate `size-adjust`,
`ascent-override`, and `descent-override` values that minimize layout shift.

## CSS tips

- Use `rem` for `font-size` (respects user's browser font size preference).
- Use `px` or `rem` for max-width — avoid `ch` with custom fonts (it varies by font).
- Line height: ~1.5 for body text, ~1.2 for headings.
