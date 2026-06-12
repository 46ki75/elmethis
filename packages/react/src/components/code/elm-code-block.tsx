import type { ComponentPropsWithoutRef } from "react";
import { clsx } from "clsx";

import styles from "./elm-code-block.module.css";

import { ElmLanguageIcon } from "../icon/elm-language-icon";
import { ElmInlineText } from "../typography/elm-inline-text";
import { ElmShikiHighlighter } from "./elm-shiki-highlighter";

import { useClipboard } from "../../hooks/use-clipboard";

export interface ElmCodeBlockProps extends ComponentPropsWithoutRef<"figure"> {
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

export const ElmCodeBlock = ({
  className,
  code,
  language = "txt",
  caption,
  children,
  ...props
}: ElmCodeBlockProps) => {
  const { CopyButton } = useClipboard({ content: code });

  return (
    <figure className={clsx(styles["elm-code-block"], className)} {...props}>
      <span className={styles["language-icon"]}>
        <ElmLanguageIcon language={language} />
      </span>

      <span className={styles.caption}>
        <ElmInlineText>
          {caption || language}
          {children}
        </ElmInlineText>
      </span>

      <div className={styles["copy-icon"]}>
        <CopyButton />
      </div>

      <hr className={styles.divider} />

      <div className={styles.code}>
        <ElmShikiHighlighter code={code} language={language} />
      </div>
    </figure>
  );
};
