import React from "react";

import "@styles/global.css";
import styles from "./ElmTableOfContents.module.css";
import { ElmInlineText } from "@components/typography/ElmInlineText";
import { ElmMdiIcon } from "@components/icon/ElmMdiIcon";

import { mdiMenuDown } from "@mdi/js";

export interface ElmTableOfContentsCSSVariables {}

export interface ElmTableOfContentsProps {
  style?: React.CSSProperties & ElmTableOfContentsCSSVariables;

  /**
   * The headings to display.
   */
  headings: Array<{
    level: 1 | 2 | 3 | 4 | 5 | 6;
    text: string;
    id?: string;
  }>;
}

export const ElmTableOfContents = ({
  headings,
  style,
}: ElmTableOfContentsProps) => {
  return (
    <nav className={styles.toc} style={style}>
      {headings.map((heading, index) => (
        <a
          key={index}
          className={styles.link}
          href={`#${heading.id ?? heading.text}`}
          style={{
            "--padding-left": `${heading.level * 0.5}rem`,
          } as React.CSSProperties}
        >
          <sup>
            <ElmInlineText size="0.6rem" color="#6987b8">
              {`H${heading.level}`}
            </ElmInlineText>
          </sup>
          <ElmInlineText>{heading.text}</ElmInlineText>
          <ElmMdiIcon d={mdiMenuDown} size="1em" color="#6987b8" />
        </a>
      ))}
    </nav>
  );
};
