import React, { useState } from "react";

import "@styles/global.css";
import styles from "./ElmTabs.module.css";
import type { ElmethisCSSVariables } from "@styles/variables";

export type ElmTabsCSSVariables = Pick<
  ElmethisCSSVariables,
  "--elmethis-color-primary"
>;

export interface ElmTabsProps {
  style?: React.CSSProperties & ElmTabsCSSVariables;

  className?: string;

  /** Array of tab label elements. */
  tabLabels: React.ReactNode[];

  /** Array of tab content elements corresponding to each label. */
  tabContents: React.ReactNode[];
}

export const ElmTabs = (props: ElmTabsProps) => {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  return (
    <div
      className={[styles["elm-tabs"], props.className]
        .filter(Boolean)
        .join(" ")}
      style={props.style}
    >
      <div className={styles["tab-container"]}>
        {props.tabLabels.map((tabLabel, index) => (
          <div
            key={index}
            className={`${styles.tab} ${selectedTabIndex === index ? styles.active : ""}`}
            onClick={() => setSelectedTabIndex(index)}
          >
            {tabLabel}
          </div>
        ))}
      </div>

      <div className={styles["tab-content-container"]}>
        {props.tabContents.map((content, index) => (
          <div
            key={index}
            className={`${styles["tab-content"]} ${selectedTabIndex === index ? styles.active : ""}`}
          >
            {content}
          </div>
        ))}
      </div>
    </div>
  );
};
