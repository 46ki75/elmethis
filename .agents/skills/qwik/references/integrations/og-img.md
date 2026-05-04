# Integration: OG Image (`og-img`)

> Source: `packages/docs/src/routes/docs/integrations/og-img/index.mdx`

## Installation

```bash
pnpm install og-img
```

## How it works

Return an `ImageResponse` from a server endpoint using the `html` tagged template literal. The image is generated using Satori + resvg.

```ts
// src/routes/og-image/index.ts
import type { RequestHandler } from '@builder.io/qwik-city';
import { fetchFont, ImageResponse, html } from 'og-img';

export const onGet: RequestHandler = async ({ send }) => {
  send(
    new ImageResponse(
      html`
        <div tw="text-4xl text-green-700" style="background-color: tan">
          Hello, world!
        </div>
      `,
      {
        width: 1200,
        height: 600,
        fonts: [{
          name: 'Roboto',
          data: await fetchFont('https://example.com/fonts/roboto-400.ttf'),
          weight: 400,
          style: 'normal',
        }],
      }
    )
  );
};
```

## Reference the endpoint in `<head>`

```tsx
// Static:
<meta property="og:image" content="https://example.com/og-image" />

// Dynamic (via DocumentHead):
export const head: DocumentHead = {
  meta: [{ property: 'og:image', content: 'https://example.com/og-image' }],
};
```

## Key points

- `html` tagged template literal supports Tailwind CSS classes via `tw=""`.
- Use URL search params to generate dynamic content (title, description, etc.).
- `fetchFont` helper downloads font data for the renderer.
- VS Code extension [lit-html](https://marketplace.visualstudio.com/items?itemName=bierner.lit-html) provides syntax highlighting in the template literal.
