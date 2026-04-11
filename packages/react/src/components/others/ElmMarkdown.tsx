import React, { useEffect, useState } from "react";

import "@styles/global.css";
import styles from "./ElmMarkdown.module.css";

export interface ElmMarkdownProps {
  style?: React.CSSProperties;

  /**
   * The markdown string to render.
   */
  markdown: string;
}

export const ElmMarkdown = ({ markdown, style }: ElmMarkdownProps) => {
  const [html, setHtml] = useState<string>("");

  useEffect(() => {
    // @ts-ignore - marked is an optional peer dependency
    import("marked")
      .then(({ marked }) => {
        try {
          const result = marked.setOptions({ gfm: true }).parse(markdown);
          if (typeof result === "string") {
            setHtml(result);
          } else {
            result.then(setHtml);
          }
        } catch (err) {
          console.error("Markdown rendering error:", err);
          setHtml(`<pre>${markdown}</pre>`);
        }
      })
      .catch(() => {
        setHtml(`<pre>${markdown}</pre>`);
      });
  }, [markdown]);

  return (
    <div
      className={styles["markdown-body"]}
      style={style}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
