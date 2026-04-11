import React, { useEffect, useRef, useState } from "react";

import "@styles/global.css";
import styles from "./ElmKatex.module.css";

export interface ElmKatexProps {
  style?: React.CSSProperties;

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

export const ElmKatex = ({ expression, block = false, style }: ElmKatexProps) => {
  const [html, setHtml] = useState<string | undefined>();

  useEffect(() => {
    // @ts-ignore
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

  const className = `${styles.katex}`;

  if (block) {
    return (
      <div
        className={className}
        style={{ marginBlock: "3rem", ...style }}
        dangerouslySetInnerHTML={html ? { __html: html } : undefined}
      />
    );
  }

  return (
    <span
      className={className}
      style={style}
      dangerouslySetInnerHTML={html ? { __html: html } : undefined}
    />
  );
};
