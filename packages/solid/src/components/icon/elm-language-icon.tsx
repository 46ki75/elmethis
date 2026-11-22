import { type JSX } from "@solidjs/web";
import { createMemo, Show } from "solid-js";
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
  language: string;
}

const MDI_CODE_TAGS =
  "M14.6,16.6L19.2,12L14.6,7.4L16,6L22,12L16,18L14.6,16.6M9.4,16.6L4.8,12L9.4,7.4L8,6L2,12L8,18L9.4,16.6Z";

export const ElmLanguageIcon = (props: ElmLanguageIconProps) => {
  const glyph = createMemo(() => {
    const language = normalizeLanguage(props.language);
    return language === "file" ? undefined : languageIcons[language];
  });

  return (
    <Show
      when={glyph()}
      keyed
      fallback={
        <ElmMdiIcon
          path={MDI_CODE_TAGS}
          size={String(props.size ?? 24)}
          class={props.class}
          style={props.style}
        />
      }
    >
      {(icon) => (
        <LanguageGlyph
          icon={icon}
          size={props.size ?? 24}
          class={props.class}
          style={props.style}
        />
      )}
    </Show>
  );
};
