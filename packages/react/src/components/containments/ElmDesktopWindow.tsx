import React from "react";

import "@styles/global.css";
import styles from "./ElmDesktopWindow.module.css";

export interface ElmDesktopWindowCSSVariables {}

export interface ElmDesktopWindowProps extends React.PropsWithChildren {
  style?: React.CSSProperties & ElmDesktopWindowCSSVariables;

  className?: string;

  /**
   * The minimum height of the window.
   * @default '6rem'
   */
  minHeight?: React.CSSProperties["minHeight"];
}

export const ElmDesktopWindow = ({
  minHeight = "6rem",
  ...props
}: ElmDesktopWindowProps) => {
  return (
    <div
      className={[styles.window, props.className].filter(Boolean).join(" ")}
      style={props.style}
    >
      <div className={styles.header}>
        <div
          aria-hidden
          className={styles.dot}
          style={{ "--bg": "#c48691" } as React.CSSProperties}
        ></div>
        <div
          aria-hidden
          className={styles.dot}
          style={{ "--bg": "#c9b990" } as React.CSSProperties}
        ></div>
        <div
          aria-hidden
          className={styles.dot}
          style={{ "--bg": "#7cc598" } as React.CSSProperties}
        ></div>
      </div>
      <div style={{ minHeight }}>{props.children}</div>
    </div>
  );
};
