import {
  component$,
  useSignal,
  useTask$,
  type CSSProperties,
} from "@builder.io/qwik";

import styles from "./elm-shiki-highlighter.module.scss";
import { codeToHtml } from "shiki";

export interface ElmShikiHighlighterProps {
  class?: string;

  style?: CSSProperties;

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
  ({ class: className, style, code, language = "txt" }) => {
    const rawHtml = useSignal("");

    useTask$(async ({ track }) => {
      track(() => code);
      track(() => language);

      if (!code) return;

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

    return (
      <pre
        class={[styles.code, className]}
        style={style}
        dangerouslySetInnerHTML={rawHtml.value}
      />
    );
  },
);
