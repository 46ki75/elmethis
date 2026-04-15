import React from "react";
import { mdiInformation } from "@mdi/js";

import "@styles/global.css";
import styles from "./ElmUnsupportedBlock.module.css";

import { ElmInlineText } from "@components/typography/ElmInlineText";
import type { ElmethisCSSVariables } from "@styles/variables";

export type ElmUnsupportedBlockCSSVariables = Pick<
  ElmethisCSSVariables,
  "--elmethis-margin-block-start"
>;

export interface ElmUnsupportedBlockProps {
  style?: React.CSSProperties & ElmUnsupportedBlockCSSVariables;

  className?: string;

  /**
   * Optional details text displayed below the unsupported block message.
   */
  details?: string;
}

export const ElmUnsupportedBlock = (props: ElmUnsupportedBlockProps) => {
  return (
    <div
      className={[styles.unsupported, props.className]
        .filter(Boolean)
        .join(" ")}
      style={props.style}
    >
      <div className={styles.message}>
        <svg
          viewBox="0 0 24 24"
          width="1.25rem"
          height="1.25rem"
          className={styles.icon}
        >
          <path d={mdiInformation} />
        </svg>
        <ElmInlineText color="#868e9c">UNSUPPORTED BLOCK</ElmInlineText>
      </div>
      {props.details && (
        <div className={styles.details}>
          <ElmInlineText color="#868e9c">{props.details}</ElmInlineText>
        </div>
      )}
    </div>
  );
};
