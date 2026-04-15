import React, { useEffect, useState } from "react";

import "@styles/global.css";
import styles from "./ElmKatex.module.css";
import type { ElmethisCSSVariables } from "@styles/variables";

export type ElmKatexCSSVariables = Pick<
  ElmethisCSSVariables,
  "--elmethis-margin-block-start"
>;

export interface ElmKatexProps {
  style?: React.CSSProperties & ElmKatexCSSVariables;

  className?: string;

  /**
   * The KaTeX expression to render.
   */
  expression: string;

  /**
   * Whether to render in block (display) mode.
   * Default is false (inline mode).
   */
  block?: boolean;
}

export const ElmKatex = ({
  expression,
  block = false,
  style,
  className,
}: ElmKatexProps) => {
  const [html, setHtml] = useState<string | undefined>();

  useEffect(() => {
    import("katex")
      .then(({ renderToString }) => {
        try {
          const result = renderToString(expression, {
            displayMode: block,
            output: "mathml",
          });
          setHtml(result);
        } catch (err) {
          console.error("KaTeX rendering error:", err);
        }
      })
      .catch(() => {
        // katex not available
      });
  }, [expression, block]);

  const katexClassName = [styles.katex, className].filter(Boolean).join(" ");

  if (block) {
    return (
      <div
        className={katexClassName}
        style={style}
        dangerouslySetInnerHTML={html ? { __html: html } : undefined}
      />
    );
  }

  return (
    <span
      className={katexClassName}
      style={style}
      dangerouslySetInnerHTML={html ? { __html: html } : undefined}
    />
  );
};
