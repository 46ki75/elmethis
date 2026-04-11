import React, { useEffect, useRef, useState } from "react";

import "@styles/global.css";
import styles from "./ElmShikiHighlighter.module.css";

import { getHighlighterSingleton } from "./shikiInstance";

export interface ElmShikiHighlighterProps {
  style?: React.CSSProperties;

  /**
   * The code to highlight.
   */
  code: string;

  /**
   * The language to use for highlighting.
   */
  language?: string;

  /**
   * Callback fired when rendering is complete.
   */
  onRendered?: (rendered: boolean) => void;
}

export const ElmShikiHighlighter = ({
  code,
  language = "txt",
  onRendered,
  style,
}: ElmShikiHighlighterProps) => {
  const [html, setHtml] = useState(`<pre>${code}</pre>`);
  const renderedRef = useRef(false);

  useEffect(() => {
    if (renderedRef.current) return;

    getHighlighterSingleton()
      .then((highlighter) => {
        try {
          const result = highlighter.codeToHtml(code, {
            lang: language,
            themes: {
              dark: "vitesse-dark",
              light: "vitesse-light",
            },
            colorReplacements: {
              "#ffffff": "transparent",
              "#121212": "transparent",
            },
          });
          setHtml(result);
        } catch {
          // keep plain fallback
        } finally {
          renderedRef.current = true;
          onRendered?.(true);
        }
      })
      .catch(() => {
        renderedRef.current = true;
        onRendered?.(true);
      });
  }, [code, language, onRendered]);

  return (
    <div className={styles.code} style={style}>
      <div
        className="shiki"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
};
