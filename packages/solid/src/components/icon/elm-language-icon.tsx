import { createMemo, mergeProps, Show, type JSX } from "solid-js";
import {
  LANGUAGES,
  languageIcons,
  normalizeLanguage,
  type Language,
} from "@elmethis/core";

import { ElmMdiIcon } from "./elm-mdi-icon";
import { LanguageGlyph } from "./language-glyph";

export { LANGUAGES, type Language };

export interface ElmLanguageIconProps {
  class?: string;
  style?: JSX.CSSProperties | string;
  /** The size of the icon. */
  size?: number;
  /** The language of the icon. */
  language: Language | string;
}

const MDI_CODE_TAGS =
  "M14.6,16.6L19.2,12L14.6,7.4L16,6L22,12L16,18L14.6,16.6M9.4,16.6L4.8,12L9.4,7.4L8,6L2,12L8,18L9.4,16.6Z";

export const ElmLanguageIcon = (props: ElmLanguageIconProps) => {
  const merged = mergeProps({ size: 24 }, props);
  const glyph = createMemo(() => {
    const language = normalizeLanguage(merged.language);
    return language === "file" ? undefined : languageIcons[language];
  });

  return (
    <Show
      when={glyph()}
      keyed
      fallback={
        <ElmMdiIcon
          d={MDI_CODE_TAGS}
          size={String(merged.size)}
          class={merged.class}
          style={merged.style}
        />
      }
    >
      {(icon) => (
        <LanguageGlyph
          icon={icon}
          size={merged.size}
          class={merged.class}
          style={merged.style}
        />
      )}
    </Show>
  );
};
