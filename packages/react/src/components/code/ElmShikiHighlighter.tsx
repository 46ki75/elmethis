import React, { useEffect, useState } from "react";

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

  useEffect(() => {
    let cancelled = false;

    getHighlighterSingleton()
      .then((highlighter) => {
        if (cancelled) return;
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
          if (!cancelled) {
            setHtml(result);
            onRendered?.(true);
          }
        } catch {
          if (!cancelled) onRendered?.(true);
        }
      })
      .catch(() => {
        if (!cancelled) onRendered?.(true);
      });

    return () => {
      cancelled = true;
    };
  }, [code, language, onRendered]);

  return (
    <div className={styles.code} style={style}>
      <div className="shiki" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
};
