import { component$, useSignal, useTask$ } from "@builder.io/qwik";

import "./elm-shiki-highlighter.global.scss";

import { getHighlighterSingleton } from "./shikiInstance";

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

const render = async (
  props: Required<ElmShikiHighlighterProps>,
): Promise<string | undefined> => {
  const highlighter = await getHighlighterSingleton();

  try {
    return highlighter.codeToHtml(props.code, {
      lang: props.language,
      themes: {
        dark: "vitesse-dark",
        light: "vitesse-light",
      },
      colorReplacements: {
        "#ffffff": "transparent",
        "#121212": "transparent",
      },
    });
  } catch {
    // do nothing
  } finally {
    // do nothing
  }
};

export const ElmShikiHighlighter = component$<ElmShikiHighlighterProps>(
  ({ code, language = "txt" }) => {
    const rawHtml = useSignal(code);

    useTask$(async () => {
      const html = await render({
        code,
        language,
      });

      if (html) rawHtml.value = html;
    });

    return <pre dangerouslySetInnerHTML={rawHtml.value} />;
  },
);
