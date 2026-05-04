# Integration: Partytown

> Source: `packages/docs/src/routes/docs/integrations/partytown/index.mdx`

## Purpose

Offload third-party scripts (Google Analytics, Facebook Pixel, etc.) to a web worker, freeing the main thread for your app.

## Installation

```bash
pnpm run qwik add partytown
```

Updates `vite.config.ts` and adds `src/components/partytown/partytown.tsx`.

## Usage

In `root.tsx`:

```tsx
import { QwikPartytown } from './components/partytown/partytown';

export default component$(() => (
  <QwikCityProvider>
    <head>
      <QwikPartytown forward={['gtag', 'dataLayer.push']} />
      {/* Google Analytics — note type="text/partytown" */}
      <script
        async
        type="text/partytown"
        src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX"
      />
      <script
        type="text/partytown"
        dangerouslySetInnerHTML={`
          window.dataLayer = window.dataLayer || [];
          window.gtag = function() { dataLayer.push(arguments); }
          gtag('js', new Date());
          gtag('config', 'G-XXXXXX');
        `}
      />
    </head>
    <body lang="en" />
  </QwikCityProvider>
));
```

## Key points

- Change `type="text/javascript"` → `type="text/partytown"` on any script to offload it.
- `forward` prop: list of globals the main thread needs to call (proxied to the worker).
- No code changes needed in the third-party scripts themselves.
- See [Partytown docs](https://partytown.qwik.dev/configuration) for advanced configuration.
