import { type JSX } from "@solidjs/web";
import { omit } from "solid-js";
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
  const rest = omit(props, "class", "children", "code", "language", "caption");

  return (
    <figure {...rest} class={clsx(styles["elm-code-block"], props.class)}>
      <span class={styles["language-icon"]}>
        <ElmLanguageIcon language={props.language ?? "txt"} />
      </span>

      <span class={styles.caption}>
        <ElmInlineText>
          {props.caption || (props.language ?? "txt")}
          {props.children}
        </ElmInlineText>
      </span>

      <div class={styles["copy-icon"]}>
        <ElmCopyIcon content={props.code} />
      </div>

      <hr class={styles.divider} />

      <div class={styles.code}>
        <ElmShikiHighlighter
          code={props.code}
          language={props.language ?? "txt"}
        />
      </div>
    </figure>
  );
};
