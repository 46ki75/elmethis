import { component$, PropsOf, useSignal, useTask$ } from "@qwik.dev/core";

import styles from "./elm-shiki-highlighter.module.css";
import { codeToHtml, type ThemeRegistrationRaw } from "shiki";
import ikumaDark from "@46ki75/ikuma-theme/dark";
import ikumaLight from "@46ki75/ikuma-theme/light";

export interface ElmShikiHighlighterProps extends PropsOf<"pre"> {
  /**
   * The code to display.
   */
  code: string;

  /**
   * The language of the code.
   */
  language?: string;
}

export const ElmShikiHighlighter = component$<ElmShikiHighlighterProps>(
  ({ class: className, code, language = "txt", ...props }) => {
    const rawHtml = useSignal("");

    useTask$(async ({ track }) => {
      track(() => code);
      track(() => language);

      if (!code) return;

      try {
        rawHtml.value = await codeToHtml(code, {
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
      } catch {
        rawHtml.value = `<pre>${code.replace(/</g, "&lt;")}</pre>`;
      }
    });

    return (
      <pre
        class={[styles["elm-shiki-highlighter"], className]}
        dangerouslySetInnerHTML={rawHtml.value}
        {...props}
      />
    );
  },
);
