---
paths:
  - "packages/qwik/src/components/a2ui/**"
  - "packages/react/src/components/a2ui/**"
  - "packages/solid/src/components/a2ui/**"
  - "packages/vue/src/components/a2ui/**"
---

# A2UI catalogs

- **qwik and vue each keep two renderer catalogs**: `catalog/basic-catalog.tsx` (official A2UI basic
  primitives) and `catalog/notion-block-catalog.tsx` (`basicCatalog.extend(...)` with richer `Elm*`
  overrides). `ElmA2ui`'s `catalog` prop defaults to `basicCatalog` when omitted — most Storybook
  demo stories never pass `catalog={notionBlockCatalog}`, so they render through the _unextended_
  catalog. A renderer-level fix (styling, spacing, behavior) made only in `notion-block-catalog.tsx`
  silently misses every consumer using the default catalog — check both files.
- **react has a single combined catalog** (`catalog/notion-block-catalog.tsx` only, no separate
  basic-catalog) since it binds through the official `@a2ui/react` package — the dual-catalog
  gotcha above does not apply to react.
- **solid keeps paired basic and Notion catalogs but defaults to `notionBlockCatalog`.** Its
  Solid-native binder uses `CatalogRenderer` entries that combine each schema with its render
  function. Customize `ElmA2ui` through `catalog={basicCatalog.extend(defineRenderer(...))}` or by
  extending `notionBlockCatalog`; unlike React, Solid does not accept a `components` array.
