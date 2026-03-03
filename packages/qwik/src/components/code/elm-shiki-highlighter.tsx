import { component$, useSignal, useTask$ } from "@builder.io/qwik";

import styles from "./elm-shiki-highlighter.module.scss";

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
      const currentCode = track(() => code);
      const currentLang = track(() => language);

      const { getHighlighterSingleton } = await import("./shikiInstance");
      const highlighter = await getHighlighterSingleton();

      try {
        rawHtml.value = highlighter.codeToHtml(currentCode, {
          lang: currentLang,
          themes: { dark: "vitesse-dark", light: "vitesse-light" },
          colorReplacements: {
            "#ffffff": "transparent",
            "#121212": "transparent",
          },
        });
      } catch {
        rawHtml.value = `<pre>${currentCode.replace(/</g, "&lt;")}</pre>`;
      }
    });

    return <pre class={styles.code} dangerouslySetInnerHTML={rawHtml.value} />;
  },
);
