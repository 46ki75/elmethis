import React from "react";
import type { Property } from "csstype";

import "@styles/global.css";
import styles from "./ElmTable.module.css";

import { mdiTable } from "@mdi/js";
import { HasRowHeaderContext } from "./TableContext";
import { ElmInlineText } from "@components/typography/ElmInlineText";

export interface ElmTableCSSVariables {
  "--margin-block"?: Property.MarginBlock;
}

export interface ElmTableProps {
  style?: React.CSSProperties & ElmTableCSSVariables;

  /**
   * The margin of the table.
   */
  margin?: Property.MarginBlock;

  /**
   * Optional caption for the table.
   */
  caption?: string;

  /**
   * Whether the first cell in each row is a row header.
   */
  hasRowHeader?: boolean;

  /**
   * The header section (use ElmTableHeader).
   */
  header?: React.ReactNode;

  /**
   * The body section (use ElmTableBody).
   */
  body?: React.ReactNode;
}

export const ElmTable = ({
  margin,
  caption,
  hasRowHeader = false,
  header,
  body,
  style,
}: ElmTableProps) => {
  return (
    <HasRowHeaderContext.Provider value={hasRowHeader}>
      <table
        className={styles.table}
        style={{ "--margin-block": margin, ...style } as React.CSSProperties}
      >
        {caption != null && (
          <caption>
            <span className={styles.caption}>
              <span className={styles.spacing} />
              <span className={styles["caption-inner"]}>
                <svg viewBox="0 0 24 24" width="1rem" height="1rem">
                  <path d={mdiTable} fill="#6987b8" />
                </svg>
                <ElmInlineText>{caption}</ElmInlineText>
              </span>
              <span className={styles.spacing} />
            </span>
          </caption>
        )}
        {header}
        {body}
      </table>
    </HasRowHeaderContext.Provider>
  );
};
