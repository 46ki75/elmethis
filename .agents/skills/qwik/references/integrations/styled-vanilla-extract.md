# Integration: styled-vanilla-extract

> Source: `packages/docs/src/routes/docs/integrations/styled-vanilla-extract/index.mdx`

## Installation

```bash
pnpm run qwik add styled-vanilla-extract
```

## Usage — vanilla-extract style

```ts
// styles.css.ts
import { style } from 'styled-vanilla-extract/qwik';

export const blueBox = style({
  display: 'block',
  width: '100%',
  height: '500px',
  background: 'blue',
});
```

```tsx
// component.tsx
import { blueBox } from './styles.css';

export const Cmp = component$(() => <div class={blueBox} />);
```

## Usage — styled-components style

```ts
// styles.css.ts
import { styled } from 'styled-vanilla-extract/qwik';

export const BlueBox = styled.div`
  display: block;
  width: 100%;
  height: 500px;
  background: blue;
`;
```

```tsx
import { BlueBox } from './styles.css';
export const Cmp = component$(() => <BlueBox />);
```

## Key points

- **Zero-runtime** — styles are extracted at build time via vanilla-extract.
- Two APIs: low-level `style()` (vanilla-extract) and high-level `styled.*` (styled-components syntax).
- Avoids the SSR streaming issues of emotion and other runtime CSS-in-JS libraries.
- `styles.css.ts` files are processed at build time (not imported into the client bundle).
