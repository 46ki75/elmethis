import type { CSSProperties } from "react";

import {
  LANGUAGES,
  languageIcons,
  normalizeLanguage,
  type Language,
} from "@elmethis/core";
import { LanguageGlyph } from "./language-glyph";
import { ElmMdiIcon } from "./elm-mdi-icon";
import { mdiCodeTags } from "@mdi/js";

// Re-exported for the Storybook radio control and the `Language` union.
export { LANGUAGES, type Language };

export interface ElmLanguageIconProps {
  className?: string;

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

export const ElmLanguageIcon = ({
  className,
  style,
  size = 24,
  language,
}: ElmLanguageIconProps) => {
  const normalized = normalizeLanguage(language);

  if (normalized === "file") {
    return <ElmMdiIcon d={mdiCodeTags} size={String(size)} />;
  }

  return (
    <LanguageGlyph
      icon={languageIcons[normalized]}
      size={size}
      className={className}
      style={style}
    />
  );
};
