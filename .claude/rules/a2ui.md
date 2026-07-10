---
paths:
  - "packages/qwik/src/components/a2ui/**"
  - "packages/react/src/components/a2ui/**"
  - "packages/vue/src/components/a2ui/**"
---

# A2UI catalogs

- **qwik and vue each keep two renderer catalogs**: `catalog/basic-catalog.tsx` (official A2UI basic
  primitives) and `catalog/block-catalog.tsx` (`basicCatalog.extend(...)` with richer `Elm*`
  overrides). `ElmA2ui`'s `catalog` prop defaults to `basicCatalog` when omitted — most Storybook
  demo stories never pass `catalog={blockCatalog}`, so they render through the _unextended_
  catalog. A renderer-level fix (styling, spacing, behavior) made only in `block-catalog.tsx`
  silently misses every consumer using the default catalog — check both files.
- **react has a single combined catalog** (`catalog/block-catalog.tsx` only, no separate
  basic-catalog) since it binds through the official `@a2ui/react` package — the dual-catalog
  gotcha above does not apply to react.
