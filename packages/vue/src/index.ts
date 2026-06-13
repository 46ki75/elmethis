// Design tokens — the single source of truth lives in `@elmethis/core`
// (`token.ts` → `tokens.css`). Every component consumes these `--elmethis-*`
// custom properties; theming is native via `light-dark()` + `color-scheme`.
import "@elmethis/core/tokens.css";

// Components and hooks are re-exported here as they are ported from the
// `@elmethis/qwik` reference implementation.

// Code
export {
  ElmShikiHighlighter,
  type ElmShikiHighlighterProps,
} from "./components/code/elm-shiki-highlighter";

// Containments
export {
  ElmModal,
  type ElmModalProps,
} from "./components/containments/elm-modal";

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
export {
  ElmMdiIcon,
  type ElmMdiIconProps,
} from "./components/icon/elm-mdi-icon";

// Typography
export {
  ElmDivider,
  type ElmDividerProps,
} from "./components/typography/elm-divider";
export {
  ElmInlineText,
  type ElmInlineTextProps,
} from "./components/typography/elm-inline-text";

// Hooks
export { useClipboard, type UseClipboardOptions } from "./hooks/use-clipboard";
export {
  THEME_CHANGE_EVENT,
  useElmethisTheme,
} from "./hooks/use-elmethis-theme";
export { useModal, type UseModalOptions } from "./hooks/use-modal";
