// Design tokens — the single source of truth lives in `@elmethis/core`
// (`token.ts` → `tokens.css`). Every component consumes these `--elmethis-*`
// custom properties; theming is native via `light-dark()` + `color-scheme`.
import "@elmethis/core/tokens.css";

// Components and hooks are re-exported here as they are ported from the
// `@elmethis/qwik` reference implementation.

// Code
export {
  ElmCodeBlock,
  type ElmCodeBlockProps,
} from "./components/code/elm-code-block";
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
  ElmTab,
  ElmTabList,
  ElmTabPanel,
  ElmTabs,
  type ElmTabListProps,
  type ElmTabPanelProps,
  type ElmTabProps,
  type ElmTabsProps,
} from "./components/containments/elm-tabs";
export {
  ElmToggle,
  type ElmToggleProps,
} from "./components/containments/elm-toggle";
export {
  ElmTooltip,
  type ElmTooltipProps,
} from "./components/containments/elm-tooltip";

// Fallback
export {
  ElmBlockFallback,
  type ElmBlockFallbackProps,
} from "./components/fallback/elm-block-fallback";
export {
  ElmRectangleWave,
  type ElmRectangleWaveProps,
} from "./components/fallback/elm-rectangle-wave";
export {
  ElmUnsupportedBlock,
  type ElmUnsupportedBlockProps,
} from "./components/fallback/elm-unsupported-block";

// Form
export { ElmButton, type ElmButtonProps } from "./components/form/elm-button";
export {
  ElmCheckbox,
  type ElmCheckboxProps,
} from "./components/form/elm-checkbox";
export {
  ElmSelect,
  type ElmSelectOption,
  type ElmSelectProps,
} from "./components/form/elm-select";
export { ElmSwitch, type ElmSwitchProps } from "./components/form/elm-switch";
export {
  ElmTextArea,
  type ElmTextAreaProps,
} from "./components/form/elm-text-area";
export {
  ElmTextField,
  type ElmTextFieldProps,
} from "./components/form/elm-text-field";
export {
  ElmValidation,
  type ElmValidationProps,
} from "./components/form/elm-validation";

// Icon
export {
  ElmCopyIcon,
  type ElmCopyIconProps,
} from "./components/icon/elm-copy-icon";
export {
  ElmDotLoadingIcon,
  type ElmDotLoadingIconProps,
} from "./components/icon/elm-dot-loading-icon";
export {
  ElmInlineIcon,
  type ElmInlineIconProps,
} from "./components/icon/elm-inline-icon";
export {
  ElmLanguageIcon,
  type ElmLanguageIconProps,
} from "./components/icon/elm-language-icon";
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

// Media
export {
  ElmBlockImage,
  type ElmBlockImageProps,
} from "./components/media/elm-block-image";
export { ElmFile, type ElmFileProps } from "./components/media/elm-file";

// Navigation
export {
  ElmBookmark,
  type ElmBookmarkProps,
} from "./components/navigation/elm-bookmark";
export {
  ElmBreadcrumb,
  type ElmBreadcrumbProps,
} from "./components/navigation/elm-breadcrumb";
export {
  ElmPageTop,
  type ElmPageTopProps,
} from "./components/navigation/elm-page-top";

// Others
export {
  ElmColorPrimitiveSample,
  type ElmColorPrimitiveSampleProps,
} from "./components/others/elm-color-primitive-sample";
export {
  ElmColorSemanticSample,
  type ElmColorSemanticSampleProps,
} from "./components/others/elm-color-semantic-sample";
export { ElmJarkup, type ElmJarkupProps } from "./components/others/elm-jarkup";
export {
  ElmMarkdown,
  type ElmMarkdownProps,
} from "./components/others/elm-markdown";
export {
  useWordle,
  type UseWordleOptions,
  type LetterResult,
  type LetterStatus,
  type GameStatus,
} from "./components/others/use-wordle";

// Table
export * from "./components/table";

// Typography
export {
  ElmBlockQuote,
  type ElmBlockQuoteProps,
} from "./components/typography/elm-block-quote";
export {
  ElmCallout,
  type ElmCalloutProps,
} from "./components/typography/elm-callout";
export {
  ElmDivider,
  type ElmDividerProps,
} from "./components/typography/elm-divider";
export {
  ElmFragmentIdentifier,
  type ElmFragmentIdentifierProps,
} from "./components/typography/elm-fragment-identifier";
export {
  ElmHeading,
  type ElmHeadingProps,
} from "./components/typography/elm-heading";
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
export { useClipboard, type UseClipboardOptions } from "./hooks/use-clipboard";
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
export { useModal, type UseModalOptions } from "./hooks/use-modal";
export { useThrottledQueue, ThrottledQueue } from "./hooks/use-throttled-queue";
export {
  useThrottledSignal,
  type UseThrottledSignalReturn,
} from "./hooks/use-throttled-signal";
export {
  useThrottledStore,
  type UseThrottledStoreReturn,
} from "./hooks/use-throttled-store";
