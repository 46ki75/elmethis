import { component$, useSignal, useTask$ } from "@builder.io/qwik";

import styles from "./elm-shiki-highlighter.module.scss";
import { codeToHtml } from "shiki";

export interface ElmShikiHighlighterProps {
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
  ({ code, language = "txt" }) => {
    const rawHtml = useSignal("");

    useTask$(async ({ track }) => {
      track(() => code);
      track(() => language);

      try {
        rawHtml.value = await codeToHtml(code, {
          lang: language,
          themes: { dark: "vitesse-dark", light: "vitesse-light" },
          colorReplacements: {
            "#ffffff": "transparent",
            "#121212": "transparent",
          },
        });
      } catch {
        rawHtml.value = `<pre>${code.replace(/</g, "&lt;")}</pre>`;
      }
    });

    return <pre class={styles.code} dangerouslySetInnerHTML={rawHtml.value} />;
  },
);
