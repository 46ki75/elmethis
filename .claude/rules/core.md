---
paths:
  - "packages/core/**"
---

# @elmethis/core (the shared hub)

- Framework-agnostic only — no Qwik/React/Vue imports. Everything here is consumed by all three libs.
- **Design tokens**: authored in `src/style/token.ts`; `scripts/build-tokens.ts` emits
  `dist/tokens.css`. Edit the source, never `dist/`.
- **DESIGN.md guides**: `scripts/build-design-md.ts` resolves semantic tokens into
  `dist/design/{light,dark}/DESIGN.md` and validates them with `@google/design.md`.
- **A2UI catalogs**: `src/a2ui/` + `scripts/emit-catalog.ts` produce
  `dist/a2ui/v0_9/notion_block_catalog.json` (published to Pages).
- **Language icons**: registered in `src/icon/languages/registry.ts`.
- Build = `tsdown`, then the catalog, tokens.css, and DESIGN.md emitters. Rebuild after changes so
  downstream libs pick them up.
