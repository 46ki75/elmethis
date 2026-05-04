# Integration: Image Optimization

> Source: `packages/docs/src/routes/docs/integrations/image-optimization/index.mdx`

## Option 1: Built-in Responsive Images (`vite-imagetools`)

No additional packages needed — built into Qwik.

```tsx
import Image from '~/media/photo.png?jsx';  // ?jsx suffix required

export default component$(() => <Image />);
```

**What happens:**

- Image converted to multiple WebP sizes (200, 400, 600, 800, 1200 px).
- Generates `<img>` with `srcset`, `width`, `height`, `loading="lazy"`, `decoding="async"`.
- Zero runtime JS.
- Hashed filenames for immutable caching.

**Customization:**

```tsx
import Image from '~/media/photo.png?format=png&quality=100&jsx';
```

## Option 2: `@unpic/qwik`

Works with image CDNs (Cloudinary, Cloudflare, Imgix, Shopify, etc.):

```bash
pnpm add @unpic/qwik
```

```tsx
import { Image } from '@unpic/qwik';

<Image
  src="https://cdn.shopify.com/.../photo.jpeg"
  layout="constrained"
  width={800}
  height={600}
  alt="Photo"
/>
```

## Option 3: `qwik-image`

```bash
pnpm install qwik-image
```

Requires a custom image transformer (connect to any CDN):

```tsx
import { $, component$ } from '@builder.io/qwik';
import { Image, useImageProvider } from 'qwik-image';

export default component$(() => {
  useImageProvider({
    resolutions: [640],
    imageTransformer$: $(({ src, width, height }) =>
      `https://my-cdn.com/${src}?w=${width}&h=${height}&format=webp`
    ),
  });
  return <Image layout="constrained" width={400} height={500} src="image/path" />;
});
```

## Key points

- Built-in `?jsx` approach: zero runtime, best for local images.
- `@unpic/qwik`: best for CDN-hosted images.
- Neither is a CDN itself — they work with existing CDNs.
