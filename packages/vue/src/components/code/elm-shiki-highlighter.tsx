import { defineComponent, ref, watch, type HTMLAttributes } from "vue";
import { clsx } from "clsx";
import { codeToHtml, type ThemeRegistrationRaw } from "shiki";
import ikumaDark from "@46ki75/ikuma-theme/dark";
import ikumaLight from "@46ki75/ikuma-theme/light";

import styles from "./elm-shiki-highlighter.module.css";

export interface ElmShikiHighlighterProps extends HTMLAttributes {
  /**
   * The code to display.
   */
  code: string;

  /**
   * The language of the code.
   */
  language?: string;
}

export const ElmShikiHighlighter = defineComponent({
  name: "ElmShikiHighlighter",
  inheritAttrs: false,
  props: {
    code: { type: String, required: true },
    language: { type: String, default: "txt" },
  },
  setup(props, { attrs }) {
    const rawHtml = ref("");

    const highlight = async (
      code: string,
      language: string,
      isActive: () => boolean,
    ): Promise<void> => {
      if (!code) {
        if (isActive()) rawHtml.value = "";
        return;
      }
      try {
        const html = await codeToHtml(code, {
          lang: language,
          themes: {
            dark: ikumaDark as unknown as ThemeRegistrationRaw,
            light: ikumaLight as unknown as ThemeRegistrationRaw,
          },
          // Emit both `--shiki-light*` and `--shiki-dark*` custom properties
          // (instead of inlining one theme) so the CSS can resolve them with
          // native light-dark(). See elm-shiki-highlighter.module.css.
          defaultColor: false,
          colorReplacements: {
            "#ffffff": "transparent",
            "#121212": "transparent",
          },
        });
        if (isActive()) rawHtml.value = html;
      } catch {
        if (isActive())
          rawHtml.value = `<pre>${code.replace(/</g, "&lt;")}</pre>`;
      }
    };

    // Re-highlight whenever the code or language changes; `onCleanup` cancels a
    // stale in-flight highlight so a fast edit can't overwrite a newer one.
    watch(
      [() => props.code, () => props.language],
      ([code, language], _old, onCleanup) => {
        let active = true;
        onCleanup(() => {
          active = false;
        });
        void highlight(code, language, () => active);
      },
      { immediate: true },
    );

    return () => {
      const { class: className, ...rest } = attrs as Record<string, unknown>;
      return (
        <pre
          class={clsx(
            styles["elm-shiki-highlighter"],
            className as string | undefined,
          )}
          innerHTML={rawHtml.value}
          {...rest}
        />
      );
    };
  },
});
