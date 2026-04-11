import React from "react";

import "@styles/global.css";
import styles from "./ElmBookmarkIcon.module.css";
import { ElmMdiIcon } from "./ElmMdiIcon";
import { ElmInlineText } from "../typography/ElmInlineText";
import { mdiEarth } from "@mdi/js";

export interface ElmBookmarkIconCSSVariables {}

export interface ElmBookmarkIconProps {
  style?: React.CSSProperties & ElmBookmarkIconCSSVariables;

  /**
   * The display name for the bookmark.
   */
  name?: string;

  /**
   * The URL the bookmark links to.
   */
  href: string;

  /**
   * The favicon URL for the bookmark.
   */
  favicon?: string;
}

export const ElmBookmarkIcon = (props: ElmBookmarkIconProps) => {
  const { name, href, favicon, style } = props;

  return (
    <a
      className={styles.wrapper}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={style}
    >
      {favicon != null ? (
        <img
          className={styles.favicon}
          src={favicon}
          alt={`favicon of ${name ?? href}`}
        />
      ) : (
        <ElmMdiIcon d={mdiEarth} size="2.5rem" style={{ opacity: 0.7 }} />
      )}

      <div className={styles.text}>
        <ElmInlineText size=".6rem">{name ?? href}</ElmInlineText>
      </div>
    </a>
  );
};
