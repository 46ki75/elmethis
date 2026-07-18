import { mergeProps, splitProps, type JSX } from "solid-js";
import { clsx } from "clsx";

import { ElmCopyIcon } from "../icon/elm-copy-icon";
import { ElmLanguageIcon } from "../icon/elm-language-icon";
import { ElmInlineText } from "../typography/elm-inline-text";
import { ElmShikiHighlighter } from "./elm-shiki-highlighter";
import styles from "./elm-code-block.module.css";

export interface ElmCodeBlockProps extends JSX.HTMLAttributes<HTMLElement> {
  /** The code to display. */
  code: string;

  /** The language of the code. Defaults to plaintext. */
  language?: string;

  /** The caption. The language is used when this is not provided. */
  caption?: string;
}

export const ElmCodeBlock = (props: ElmCodeBlockProps) => {
  const merged = mergeProps({ language: "txt" }, props);
  const [local, rest] = splitProps(merged, [
    "class",
    "children",
    "code",
    "language",
    "caption",
  ]);

  return (
    <figure {...rest} class={clsx(styles["elm-code-block"], local.class)}>
      <span class={styles["language-icon"]}>
        <ElmLanguageIcon language={local.language} />
      </span>

      <span class={styles.caption}>
        <ElmInlineText>
          {local.caption || local.language}
          {local.children}
        </ElmInlineText>
      </span>

      <div class={styles["copy-icon"]}>
        <ElmCopyIcon content={local.code} />
      </div>

      <hr class={styles.divider} />

      <div class={styles.code}>
        <ElmShikiHighlighter code={local.code} language={local.language} />
      </div>
    </figure>
  );
};
