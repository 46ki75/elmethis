---
paths:
  - "packages/qwik/src/**"
  - "packages/react/src/**"
  - "packages/vue/src/**"
---

# Component libraries (qwik / react / vue)

- **All three mirror the same component surface** (same names/props) in each framework's idiom, but
  no single framework is a fixed reference anymore. qwik led the original recreation-wave surface;
  several newer components (`ElmButtonDropdown`, `ElmHtml`, `ElmSlider`) landed in react first and
  were ported to qwik/vue afterward. Before porting or fixing, check `git log -- <component
  files>` across all three packages to find which one actually originated it.
- Components are grouped by category under `src/components/`: `typography`, `form`, `code`, `media`,
  `navigation`, `table`, `containments`, `icon`, `a2ui`, `others`, `fallback`.
- **File naming**: kebab-case with an `elm-` prefix (`elm-callout.tsx`). Co-locate per component —
  `elm-x.tsx`, `elm-x.module.css`, `elm-x.stories.tsx`, `elm-x.spec.tsx` (+ `.browser.spec.tsx` when
  needed). No separate `__tests__` tree.
- Hooks live in `src/hooks/` as `use-*.ts(x)`, same co-location.
- Use relative imports within a package; pull shared tokens/types/catalogs from `@elmethis/core`.
- Color theming is native CSS `light-dark()` + `color-scheme` — no JS theme switch for colors.
