// Design tokens — the single source of truth lives in `@elmethis/core`
// (`token.ts` → `tokens.css`). Every component consumes these `--elmethis-*`
// custom properties; theming is native via `light-dark()` + `color-scheme`.
import "@elmethis/core/tokens.css";

// Components and hooks are re-exported here as they are ported from the
// `@elmethis/qwik` reference implementation.

// Form
export {
  ElmCheckbox,
  type ElmCheckboxProps,
} from "./components/form/elm-checkbox";

// Icon
export {
  ElmInlineIcon,
  type ElmInlineIconProps,
} from "./components/icon/elm-inline-icon";

// Typography
export {
  ElmDivider,
  type ElmDividerProps,
} from "./components/typography/elm-divider";
export {
  ElmInlineText,
  type ElmInlineTextProps,
} from "./components/typography/elm-inline-text";
