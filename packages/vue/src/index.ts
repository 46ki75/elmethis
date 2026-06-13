// Design tokens — the single source of truth lives in `@elmethis/core`
// (`token.ts` → `tokens.css`). Every component consumes these `--elmethis-*`
// custom properties; theming is native via `light-dark()` + `color-scheme`.
import "@elmethis/core/tokens.css";

// Components and hooks are re-exported here as they are ported from the
// `@elmethis/qwik` reference implementation.

// Code
export { ElmKatex, type ElmKatexProps } from "./components/code/elm-katex";
export {
  ElmShikiHighlighter,
  type ElmShikiHighlighterProps,
} from "./components/code/elm-shiki-highlighter";

// Containments
export {
  ElmCollapse,
  type ElmCollapseProps,
} from "./components/containments/elm-collapse";
export {
  ElmModal,
  type ElmModalProps,
} from "./components/containments/elm-modal";
export {
  ElmParallax,
  type ElmParallaxProps,
} from "./components/containments/elm-parallax";
export {
  ElmTooltip,
  type ElmTooltipProps,
} from "./components/containments/elm-tooltip";

// Fallback
export {
  ElmUnsupportedBlock,
  type ElmUnsupportedBlockProps,
} from "./components/fallback/elm-unsupported-block";

// Form
export {
  ElmCheckbox,
  type ElmCheckboxProps,
} from "./components/form/elm-checkbox";
export { ElmSwitch, type ElmSwitchProps } from "./components/form/elm-switch";

// Icon
export {
  ElmDotLoadingIcon,
  type ElmDotLoadingIconProps,
} from "./components/icon/elm-dot-loading-icon";
export {
  ElmInlineIcon,
  type ElmInlineIconProps,
} from "./components/icon/elm-inline-icon";
export {
  ElmMdiIcon,
  type ElmMdiIconProps,
} from "./components/icon/elm-mdi-icon";
export {
  ElmSquareLoadingIcon,
  type ElmSquareLoadingIconProps,
} from "./components/icon/elm-square-loading-icon";
export {
  ElmToggleTheme,
  type ElmToggleThemeProps,
} from "./components/icon/elm-toggle-theme";

// Navigation
export {
  ElmPageTop,
  type ElmPageTopProps,
} from "./components/navigation/elm-page-top";

// Others
export {
  useWordle,
  type UseWordleOptions,
  type UseWordleReturn,
  type LetterResult,
  type LetterStatus,
  type GameStatus,
} from "./components/others/use-wordle";

// Table
export * from "./components/table";

// Typography
export {
  ElmDivider,
  type ElmDividerProps,
} from "./components/typography/elm-divider";
export {
  ElmFragmentIdentifier,
  type ElmFragmentIdentifierProps,
} from "./components/typography/elm-fragment-identifier";
export {
  ElmInlineText,
  type ElmInlineTextProps,
} from "./components/typography/elm-inline-text";
export { ElmList, type ElmListProps } from "./components/typography/elm-list";
export {
  ElmParagraph,
  type ElmParagraphProps,
} from "./components/typography/elm-paragraph";

// Hooks
export { useClipboard, type UseClipboardOptions } from "./hooks/use-clipboard";
export {
  THEME_CHANGE_EVENT,
  useElmethisTheme,
} from "./hooks/use-elmethis-theme";
export { useModal, type UseModalOptions } from "./hooks/use-modal";
