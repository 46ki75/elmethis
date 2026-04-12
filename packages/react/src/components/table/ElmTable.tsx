import React from "react";

import "@styles/global.css";
import styles from "./ElmTable.module.css";

import { mdiTable } from "@mdi/js";
import { HasRowHeaderContext } from "./TableContext";
import { ElmInlineText } from "@components/typography/ElmInlineText";
import type { ElmethisCSSVariables } from "@styles/variables";

export type ElmTableCSSVariables = Pick<
  ElmethisCSSVariables,
  "--elmethis-margin-block-start"
>;

export interface ElmTableProps {
  style?: React.CSSProperties & ElmTableCSSVariables;

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
  caption,
  hasRowHeader = false,
  header,
  body,
  style,
}: ElmTableProps) => {
  return (
    <HasRowHeaderContext.Provider value={hasRowHeader}>
      <table className={styles.table} style={style}>
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
