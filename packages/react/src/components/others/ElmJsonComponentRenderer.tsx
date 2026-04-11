import React from "react";

import "@styles/global.css";
import styles from "./ElmJsonComponentRenderer.module.css";

export interface ElmJsonComponentRendererProps {
  style?: React.CSSProperties;

  /**
   * JSON component tree to render.
   * Accepts the jarkup-ts Component[] format.
   * Note: Full rendering requires jarkup-ts to be installed.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  jsonComponents: any[];
}

export const ElmJsonComponentRenderer = ({
  jsonComponents,
  style,
}: ElmJsonComponentRendererProps) => {
  return (
    <div className={styles["jarkup-body"]} style={style}>
      {jsonComponents.map((component, i) => (
        <div key={i} className={styles["unsupported-block"]}>
          <code>{JSON.stringify(component, null, 2)}</code>
        </div>
      ))}
    </div>
  );
};
