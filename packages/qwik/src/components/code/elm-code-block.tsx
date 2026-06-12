import { component$, PropsOf, Slot } from "@qwik.dev/core";

import styles from "./elm-code-block.module.css";

import { ElmLanguageIcon } from "../icon/elm-language-icon";
import { ElmInlineText } from "../typography/elm-inline-text";
import { ElmShikiHighlighter } from "./elm-shiki-highlighter";

import { useClipboard } from "../../hooks/use-clipboard";

export interface ElmCodeBlockProps extends PropsOf<"figure"> {
  /**
   * The code to display.
   */
  code: string;

  /**
   * The language of the code.
   */
  language?: string;

  /**
   * The caption of the code block.
   * If not provided, the language will be used.
   */
  caption?: string;
}

export const ElmCodeBlock = component$<ElmCodeBlockProps>(
  ({ class: className, code, language = "txt", caption, ...props }) => {
    const { CopyButton } = useClipboard({ content: code });

    return (
      <figure class={[styles["elm-code-block"], className]} {...props}>
        <span class={styles["language-icon"]}>
          <ElmLanguageIcon language={language} />
        </span>

        <span class={styles.caption}>
          <ElmInlineText>
            {caption || language}
            <Slot />
          </ElmInlineText>
        </span>

        <div class={styles["copy-icon"]}>
          <CopyButton />
        </div>

        <hr class={styles.divider} />

        <div class={styles.code}>
          <ElmShikiHighlighter code={code} language={language} />
        </div>
      </figure>
    );
  },
);
