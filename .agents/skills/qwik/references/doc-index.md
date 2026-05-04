# Qwik Documentation Index

Full index of every file under `packages/docs/src/routes/docs/`.
Coverage status: ✅ covered · ⚠️ partial · ❌ not covered

---

## Qwik Core — `(qwik)/`

### Concepts

| Status | Path | Topic |
| -------- | ------ | ------- |
| ✅ | `concepts/resumable/` | Resumability — serialize/resume, no hydration |
| ✅ | `concepts/reactivity/` | Fine-grained reactivity, signal subscriptions |
| ✅ | `concepts/progressive/` | Progressive loading, lazy execution |
| ✅ | `concepts/think-qwik/` | Mental model: delay execution, resumability vs hydration |

### Core

| Status | Path | Topic |
| -------- | ------ | ------- |
| ✅ | `core/overview/` | `component$`, JSX, rendering |
| ✅ | `core/state/` | `useSignal`, `useStore`, `useComputed$`, `useResource$` |
| ✅ | `core/tasks/` | `useTask$`, `useVisibleTask$`, track, cleanup |
| ✅ | `core/events/` | `onClick$`, event modifiers, `preventdefault:` |
| ✅ | `core/slots/` | `<Slot>`, named slots, `q:slot` |
| ✅ | `core/context/` | `createContextId`, `useContextProvider`, `useContext` |
| ✅ | `core/rendering/` | Inline components, `<Resource>`, JSX rules |
| ✅ | `core/styles/` | Scoped CSS, CSS modules, CSS-in-JS, styled-vanilla-extract |

### Advanced

| Status | Path | Topic |
| -------- | ------ | ------- |
| ✅ | `advanced/qrl/` | QRL format, encoding, captured variables, why not `import()` |
| ✅ | `advanced/optimizer/` | Optimizer rules: `$` extraction, lazy-loadable symbols |
| ✅ | `advanced/dollar/` | `$` suffix transform — full rules, what can be captured |
| ✅ | `advanced/qwikloader/` | QwikLoader: inline script, global event listeners |
| ✅ | `advanced/modules-prefetching/` | Speculative module fetching, bundle graph |
| ✅ | `advanced/containers/` | Containers: multiple Qwik apps on one page |
| ✅ | `advanced/library/` | Building a Qwik component library |
| ✅ | `advanced/vite/` | Vite plugin config, `qwikVite()` options |
| ✅ | `advanced/eslint/` | ESLint plugin rules for Qwik |
| ✅ | `advanced/custom-build-dir/` | Custom output directory |

### Other

| Status | Path | Topic |
| -------- | ------ | ------- |
| ✅ | `getting-started/` | Project scaffold, `create-qwik`, structure |
| ✅ | `faq/` | Common questions: SSR, hydration, React comparison |
| ✅ | `deprecated-features/` | `useClientEffect$` removal, migration guide |
| ✅ | `(index)` | Qwik landing overview |

---

## Qwik City — `(qwikcity)/`

### Core

| Status | Path | Topic |
| -------- | ------ | ------- |
| ✅ | `qwikcity/` | Qwik City overview |
| ✅ | `routing/` | File-based routing, dynamic `[param]`, catch-all `[...rest]` |
| ✅ | `layout/` | Layouts, nested layouts, `<Slot>` in layouts |
| ✅ | `pages/` | Page components, `head` export, `DocumentHead` |
| ✅ | `route-loader/` | `routeLoader$`, `useLoad`, `fail`, `error`, `redirect` |
| ✅ | `action/` | `routeAction$`, `globalAction$`, `Form`, Zod validation |
| ✅ | `middleware/` | `onRequest`, `onGet`, etc., middleware chain |
| ✅ | `endpoints/` | Pure data endpoints (`onGet` returning JSON) |
| ✅ | `server$/` | `server$` — inline RPC, streaming, abort |
| ✅ | `re-exporting-loaders/` | Re-exporting loaders from non-route files |
| ✅ | `validator/` | `validator$` — custom request validators for actions/loaders |
| ✅ | `caching/` | `cacheControl()`, stale-while-revalidate, CDN headers |
| ✅ | `error-handling/` | `ServerError`, error interceptor middleware |
| ✅ | `html-attributes/` | `containerAttributes`, `lang`, `dir` in `entry.ssr.tsx` |
| ✅ | `project-structure/` | Directory layout, `src/routes`, `src/components`, etc. |

### Advanced

| Status | Path | Topic |
| -------- | ------ | ------- |
| ✅ | `advanced/routing/` | 404 pages, grouped layouts `(name)`, named layouts `@name`, plugin files |
| ✅ | `advanced/request-handling/` | `RequestEvent` API, cookie API, `onRequest` |
| ✅ | `advanced/complex-forms/` | Dot-notation input names for arrays/objects in FormData |
| ✅ | `advanced/speculative-module-fetching/` | Bundle graph, pre-populating cache |
| ✅ | `advanced/menu/` | `menu.md` for sidebar navigation |
| ✅ | `advanced/plugins/` | `plugin.ts` / `plugin@name.ts`, execution order |
| ✅ | `advanced/content-security-policy/` | CSP nonce, `useCSP()` |
| ✅ | `advanced/sitemaps/` | `sitemap.xml` generation |
| ✅ | `advanced/static-assets/` | Serving static files, `public/` folder |

### API Reference

| Status | Path | Topic |
| -------- | ------ | ------- |
| ✅ | `api/` | `useLocation`, `useNavigate`, `Link`, `routeLoader$`, all City exports |

### Guides

| Status | Path | Topic |
| -------- | ------ | ------- |
| ✅ | `guides/best-practices/` | Inline operations, `useComputed$`, avoid `useVisibleTask$`, `useOn` |
| ✅ | `guides/serialization/` | `$` boundaries, what can/can't cross a boundary |
| ✅ | `guides/redirects/` | `redirect()`, status codes, managing multiple redirects |
| ✅ | `guides/rewrites/` | URL rewrites via middleware |
| ✅ | `guides/env-variables/` | `process.env`, `import.meta.env`, `event.env.get()` |
| ✅ | `guides/mdx/` | MDX pages, frontmatter, components in `.mdx` |
| ✅ | `guides/static-site-generation/` | SSG adapter, `onStaticGenerate`, dynamic SSG routes |
| ✅ | `guides/qwik-nutshell/` | Quick overview of all Qwik concepts |
| ✅ | `guides/react-cheat-sheet/` | React-to-Qwik mapping |
| ✅ | `guides/deploy/` | Deployment overview |
| ✅ | `guides/debugging/` | Debugging tips |
| ✅ | `guides/bundle/` | Bundle analysis |
| ✅ | `guides/capacitor/` | Capacitor integration |

### Other

| Status | Path | Topic |
| -------- | ------ | ------- |
| ✅ | `qwikcity-deprecated-features/` | Deprecated City APIs |
| ✅ | `troubleshooting/` | Common errors and fixes |

---

## Cookbook — `cookbook/`

| Status | Path | Topic |
| -------- | ------ | ------- |
| ✅ | `cookbook/` | (index) |
| ✅ | `cookbook/algolia-search/` | Algolia search integration → `references/cookbook/algolia-search.md` |
| ✅ | `cookbook/combine-request-handlers/` | Composing request handlers → `references/cookbook/combine-request-handlers.md` |
| ✅ | `cookbook/debouncer/` | Debounce signal updates → `references/cookbook/debouncer.md` |
| ✅ | `cookbook/detect-img-tag-onload/` | Image onload detection → `references/cookbook/detect-img-onload.md` |
| ✅ | `cookbook/drag&drop/` | Drag and drop → `references/cookbook/drag-and-drop.md` |
| ✅ | `cookbook/fonts/` | Font loading → `references/cookbook/fonts.md` |
| ✅ | `cookbook/glob-import/` | `import.meta.glob` → `references/cookbook/glob-import.md` |
| ✅ | `cookbook/mediaController/` | Media controller → `references/cookbook/media-controller.md` |
| ✅ | `cookbook/nav-link/` | Active nav link component → `references/cookbook/nav-link.md` |
| ✅ | `cookbook/node-docker-deploy/` | Docker deployment → `references/cookbook/node-docker-deploy.md` |
| ✅ | `cookbook/portals/` | Portal pattern → `references/cookbook/portals.md` |
| ✅ | `cookbook/streaming-deferred-loaders/` | Streaming with deferred loaders → `references/cookbook/streaming-deferred-loaders.md` |
| ✅ | `cookbook/sync-events/` | `sync$` for synchronous events → `references/cookbook/sync-events.md` |
| ✅ | `cookbook/theme-management/` | Dark/light theme → `references/cookbook/theme-management.md` |
| ✅ | `cookbook/view-transition/` | View Transitions API → `references/cookbook/view-transition.md` |

---

## Deployments — `deployments/`

| Status | Path | Topic |
| -------- | ------ | ------- |
| ✅ | `deployments/` | (index) — adapter overview, cache headers |
| ✅ | `deployments/cloudflare-pages/` | Cloudflare Pages adapter |
| ✅ | `deployments/cloudflare-workers/` | Cloudflare Workers adapter |
| ✅ | `deployments/vercel-edge/` | Vercel Edge adapter |
| ✅ | `deployments/netlify-edge/` | Netlify Edge adapter |
| ✅ | `deployments/node/` | Node.js / Express adapter |
| ✅ | `deployments/aws-lambda/` | AWS Lambda adapter |
| ✅ | `deployments/azure-swa/` | Azure Static Web Apps |
| ✅ | `deployments/azion/` | Azion CDN adapter |
| ✅ | `deployments/firebase/` | Firebase Hosting adapter |
| ✅ | `deployments/gcp-cloud-run/` | GCP Cloud Run |
| ✅ | `deployments/github-pages/` | GitHub Pages (static) |
| ✅ | `deployments/deno/` | Deno adapter |
| ✅ | `deployments/bun/` | Bun adapter |
| ✅ | `deployments/static/` | Static adapter (SSG) |
| ✅ | `deployments/self-hosting/` | Self-hosting guide |

---

## Integrations — `integrations/`

| Status | Path | Topic |
| -------- | ------ | ------- |
| ✅ | `integrations/` | (index) — integration overview |
| ✅ | `integrations/react/` | `qwik-react` integration → `references/integrations/react.md` |
| ✅ | `integrations/authjs/` | Auth.js / NextAuth integration → `references/integrations/authjs.md` |
| ✅ | `integrations/tailwind/` | Tailwind CSS v4 → `references/integrations/tailwind.md` |
| ✅ | `integrations/tailwind-v3/` | Tailwind CSS v3 → `references/integrations/tailwind-v3.md` |
| ✅ | `integrations/vitest/` | Vitest unit testing → `references/integrations/vitest.md` |
| ✅ | `integrations/playwright/` | Playwright E2E testing → `references/integrations/playwright.md` |
| ✅ | `integrations/cypress/` | Cypress E2E testing → `references/integrations/cypress.md` |
| ✅ | `integrations/i18n/` | Internationalization → `references/integrations/i18n.md` |
| ✅ | `integrations/drizzle/` | Drizzle ORM → `references/integrations/drizzle.md` |
| ✅ | `integrations/prisma/` | Prisma ORM → `references/integrations/prisma.md` |
| ✅ | `integrations/supabase/` | Supabase → `references/integrations/supabase.md` |
| ✅ | `integrations/turso/` | Turso / libSQL → `references/integrations/turso.md` |
| ✅ | `integrations/modular-forms/` | Modular Forms library → `references/integrations/modular-forms.md` |
| ✅ | `integrations/image-optimization/` | Image optimization → `references/integrations/image-optimization.md` |
| ✅ | `integrations/icons/` | Icon sets → `references/integrations/icons.md` |
| ✅ | `integrations/partytown/` | Partytown (offload 3rd-party scripts) → `references/integrations/partytown.md` |
| ✅ | `integrations/panda-css/` | Panda CSS → `references/integrations/panda-css.md` |
| ✅ | `integrations/postcss/` | PostCSS → `references/integrations/postcss.md` |
| ✅ | `integrations/styled-vanilla-extract/` | styled-vanilla-extract → `references/integrations/styled-vanilla-extract.md` |
| ✅ | `integrations/bootstrap/` | Bootstrap CSS → `references/integrations/bootstrap.md` |
| ✅ | `integrations/storybook/` | Storybook → `references/integrations/storybook.md` |
| ✅ | `integrations/nx/` | Nx monorepo → `references/integrations/nx.md` |
| ✅ | `integrations/og-img/` | OG image generation → `references/integrations/og-img.md` |
| ✅ | `integrations/orama/` | Orama full-text search → `references/integrations/orama.md` |
| ✅ | `integrations/leaflet-map/` | Leaflet maps → `references/integrations/leaflet-map.md` |
| ✅ | `integrations/builderio/` | Builder.io visual CMS → `references/integrations/builderio.md` |
| ✅ | `integrations/astro/` | Astro integration → `references/integrations/astro.md` |
| ✅ | `integrations/tauri/` | Tauri desktop app → `references/integrations/tauri.md` |

---

## Labs — `labs/`

| Status | Path | Topic |
| -------- | ------ | ------- |
| ✅ | `labs/` | (index) — experimental features |
| ✅ | `labs/insights/` | Qwik Insights — real-user bundle analytics → `references/labs/insights.md` |
| ✅ | `labs/devtools/` | Qwik DevTools browser extension → `references/labs/devtools.md` |
| ✅ | `labs/typed-routes/` | Typed route params → `references/labs/typed-routes.md` |
| ✅ | `labs/usePreventNavigate/` | `usePreventNavigate$` — block navigation → `references/labs/use-prevent-navigate.md` |

---

## Coverage summary

| Section | Covered | Partial/TODO |
| --------- | --------- | -------------- |
| Qwik Core — Concepts | 4/4 | 0 |
| Qwik Core — Core | 8/8 | 0 |
| Qwik Core — Advanced | 10/10 | 0 |
| Qwik Core — Other | 4/4 | 0 |
| Qwik City — Core | 15/15 | 0 |
| Qwik City — Advanced | 9/9 | 0 |
| Qwik City — API | 1/1 | 0 |
| Qwik City — Guides | 13/13 | 0 |
| Qwik City — Other | 2/2 | 0 |
| Cookbook | 16/16 | 0 |
| Deployments | 16/16 | 0 |
| Integrations | 29/29 | 0 |
| Labs | 5/5 | 0 |

**All 132 documented paths are now fully covered (✅).**
