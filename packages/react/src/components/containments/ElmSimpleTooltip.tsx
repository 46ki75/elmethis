import React from "react";

import "@styles/global.css";
import styles from "./ElmSimpleTooltip.module.css";
import { ElmTooltip } from "@components/containments/ElmTooltip";

export interface ElmSimpleTooltipCSSVariables {}

export interface ElmSimpleTooltipProps extends React.PropsWithChildren {
  style?: React.CSSProperties & ElmSimpleTooltipCSSVariables;

  /** Optional title for the tooltip. */
  title?: string;

  /** Text content of the tooltip. */
  text: string;
}

export const ElmSimpleTooltip = (props: ElmSimpleTooltipProps) => {
  return (
    <ElmTooltip
      original={props.children}
      tooltip={
        <div className={styles.container} style={props.style}>
          {props.title && <div className={styles.title}>{props.title}</div>}
          <div className={styles.text}>{props.text}</div>
        </div>
      }
    />
  );
};
