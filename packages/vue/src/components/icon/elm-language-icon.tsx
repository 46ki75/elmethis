import { defineComponent, h } from "vue";
import { mdiCodeTags } from "@mdi/js";

import {
  LANGUAGES,
  languageIcons,
  normalizeLanguage,
  type Language,
} from "@elmethis/core";
import { LanguageGlyph } from "./language-glyph";
import { ElmMdiIcon } from "./elm-mdi-icon";

export { LANGUAGES, type Language };

export interface ElmLanguageIconProps {
  /**
   * The size of the icon.
   */
  size?: number;

  /**
   * The language of the icon.
   */
  language: Language | string;
}

export const ElmLanguageIcon = defineComponent({
  name: "ElmLanguageIcon",
  props: {
    size: { type: Number, default: 24 },
    language: { type: String, required: true },
  },
  setup(props) {
    // inheritAttrs default: passthrough class/style merge onto the resolved
    // root svg (via LanguageGlyph) or the file fallback.
    return () => {
      const normalized = normalizeLanguage(props.language);

      if (normalized === "file") {
        return <ElmMdiIcon d={mdiCodeTags} size={String(props.size)} />;
      }

      return h(LanguageGlyph, {
        icon: languageIcons[normalized],
        size: props.size,
      });
    };
  },
});
