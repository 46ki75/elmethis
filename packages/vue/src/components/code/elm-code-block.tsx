import { defineComponent, h, type HTMLAttributes } from "vue";
import { clsx } from "clsx";

import styles from "./elm-code-block.module.css";

import { ElmLanguageIcon } from "../icon/elm-language-icon";
import { ElmInlineText } from "../typography/elm-inline-text";
import { ElmShikiHighlighter } from "./elm-shiki-highlighter";

import { useClipboard } from "../../hooks/use-clipboard";

export interface ElmCodeBlockProps extends HTMLAttributes {
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

export const ElmCodeBlock = defineComponent({
  name: "ElmCodeBlock",
  props: {
    code: { type: String, required: true },
    language: { type: String, default: "txt" },
    caption: { type: String, default: undefined },
  },
  setup(props, { slots }) {
    const { CopyButton } = useClipboard({ content: props.code });

    return () => (
      <figure class={clsx(styles["elm-code-block"])}>
        <span class={styles["language-icon"]}>
          <ElmLanguageIcon language={props.language} />
        </span>

        <span class={styles.caption}>
          <ElmInlineText>
            {props.caption || props.language}
            {slots.default?.()}
          </ElmInlineText>
        </span>

        <div class={styles["copy-icon"]}>{h(CopyButton)}</div>

        <hr class={styles.divider} />

        <div class={styles.code}>
          <ElmShikiHighlighter code={props.code} language={props.language} />
        </div>
      </figure>
    );
  },
});
