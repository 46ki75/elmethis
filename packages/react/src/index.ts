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
  ElmRectangleWave,
  type ElmRectangleWaveProps,
} from "./components/fallback/elm-rectangle-wave";

// Form
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

// Navigation
export {
  ElmPageTop,
  type ElmPageTopProps,
} from "./components/navigation/elm-page-top";

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
export { ElmList, type ElmListProps } from "./components/typography/elm-list";
export {
  ElmParagraph,
  type ElmParagraphProps,
} from "./components/typography/elm-paragraph";

// Hooks
export {
  useAsyncState,
  type UseAsyncStateOptions,
  type UseAsyncStateReturn,
} from "./hooks/use-async-state";
export {
  useAutoAnimate,
  type UseAutoAnimateOptions,
} from "./hooks/use-auto-animate";
export { useBindableSignal } from "./hooks/use-bindable-signal";
export { useBindableStore } from "./hooks/use-bindable-store";
export {
  useDebouncedSignal,
  type UseDebouncedSignalReturn,
} from "./hooks/use-debounced-signal";
export { useDebouncedStore } from "./hooks/use-debounced-store";
export {
  useDelayedSignal,
  type UseDelayedSignalReturn,
} from "./hooks/use-delayed-signal";
export {
  THEME_CHANGE_EVENT,
  useElmethisTheme,
} from "./hooks/use-elmethis-theme";
export {
  useLocalStorage,
  type UseLocalStorageOptions,
  useSessionStorage,
  type UseSessionStorageOptions,
} from "./hooks/use-storage";
export { useThrottledQueue, ThrottledQueue } from "./hooks/use-throttled-queue";
export {
  useThrottledSignal,
  type UseThrottledSignalReturn,
} from "./hooks/use-throttled-signal";
export {
  useThrottledStore,
  type UseThrottledStoreReturn,
} from "./hooks/use-throttled-store";
