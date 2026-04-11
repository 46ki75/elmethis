import React from "react";

import "@styles/global.css";
import styles from "./ElmSquareLoadingIcon.module.css";

export interface ElmSquareLoadingIconCSSVariables {}

export interface ElmSquareLoadingIconProps {
  style?: React.CSSProperties & ElmSquareLoadingIconCSSVariables;

  /**
   * Specifies the size of the icon.
   */
  size?: React.CSSProperties["width"];

  /**
   * Specifies the number of rows and columns.
   */
  dimensions?: number;
}

const DURATION = 1200;

export const ElmSquareLoadingIcon = (props: ElmSquareLoadingIconProps) => {
  const { size = "3rem", dimensions = 4, style } = props;
  const delay = DURATION / (dimensions * 3);

  const rows = Array.from({ length: dimensions });

  return (
    <div
      className={styles.wrapper}
      style={
        {
          "--size": size,
          "--dimensions": dimensions,
          "--duration": `${DURATION}ms`,
          ...style,
        } as React.CSSProperties
      }
    >
      {rows.map((_, rowIndex) =>
        rows.map((_, columnIndex) => (
          <div
            key={`${rowIndex}-${columnIndex}`}
            className={styles.square}
            style={
              {
                "--delay": `${delay * (rowIndex + columnIndex)}ms`,
              } as React.CSSProperties
            }
          />
        )),
      )}
    </div>
  );
};
