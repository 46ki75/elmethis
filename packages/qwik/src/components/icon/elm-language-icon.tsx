import { component$, type CSSProperties } from "@qwik.dev/core";
import {
  LANGUAGES,
  languageIcons,
  normalizeLanguage,
  type Language,
} from "@elmethis/core";
import { LanguageGlyph } from "./language-glyph";
import { ElmMdiIcon } from "./elm-mdi-icon";
import { mdiCodeTags } from "@mdi/js";

export { LANGUAGES, type Language };

export interface ElmLanguageIconProps {
  class?: string;

  style?: CSSProperties;

  /**
   * The size of the icon.
   */
  size?: number;

  /**
   * The language of the icon.
   */
  language: Language | string;
}

export const ElmLanguageIcon = component$<ElmLanguageIconProps>(
  ({ class: className, style, size = 24, language }) => {
    const normalized = normalizeLanguage(language);

    if (normalized === "file") {
      return <ElmMdiIcon d={mdiCodeTags} size={String(size)} />;
    }

    return (
      <LanguageGlyph
        icon={languageIcons[normalized]}
        size={size}
        class={className}
        style={style}
      />
    );
  },
);
