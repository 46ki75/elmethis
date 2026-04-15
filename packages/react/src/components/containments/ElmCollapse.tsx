import React from "react";

import "@styles/global.css";
import styles from "./ElmCollapse.module.css";
import clsx from "clsx";

export interface ElmCollapseCSSVariables {
  /**
   * In milliseconds. If set, the collapse will animate open/close over this duration.
   * Default is 200ms.
   */
  "--elmethis-scoped-collapse-transition-duration"?: string;

  /**
   * If set, this timing function will be used for the collapse open/close animation.
   * Default is "ease".
   */
  "--elmethis-scoped-collapse-transition-timing-function"?: string;
}

export type ElmCollapseProps = {
  style?: React.CSSProperties & ElmCollapseCSSVariables;

  isOpen?: boolean;
} & React.PropsWithChildren;

export const ElmCollapse = (props: ElmCollapseProps) => {
  return (
    <div
      className={clsx(styles["elm-collapse"], {
        [styles["open"]]: props.isOpen,
      })}
      style={props.style}
    >
      <div className={styles["inner"]}>{props.children}</div>
    </div>
  );
};
