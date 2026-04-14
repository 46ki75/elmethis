import React from "react";

import "@styles/global.css";
import styles from "./ElmColorTable.module.css";

import { darken } from "polished";
import { ElmColorSample } from "./ElmColorSample";

export interface ElmColorTableProps {
  style?: React.CSSProperties;

  className?: string;

  /**
   * The colors to display.
   */
  colors: { name: string; code: string }[];
}

const DARKNESS_LEVELS = [
  -3, -0.25, -0.2, -0.15, -0.1, -0.05, 0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3,
] as const;

export const ElmColorTable = ({
  colors,
  style,
  className,
}: ElmColorTableProps) => {
  return (
    <div
      className={[styles.container, className].filter(Boolean).join(" ")}
      style={style}
    >
      {colors.map((color) => (
        <div key={color.name} className={styles["row-container"]}>
          <div
            className={styles["color-name"]}
            style={{ "--color": color.code } as React.CSSProperties}
          >
            {color.name}
          </div>
          {DARKNESS_LEVELS.map((darkness) => (
            <ElmColorSample
              key={darkness}
              color={darken(darkness, color.code)}
            />
          ))}
        </div>
      ))}
    </div>
  );
};
