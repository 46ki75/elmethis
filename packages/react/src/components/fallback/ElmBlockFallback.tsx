import React from "react";
import type { Property } from "csstype";

import "@styles/global.css";
import styles from "./ElmBlockFallback.module.css";

import { ElmDotLoadingIcon } from "@components/icon/ElmDotLoadingIcon";
import { ElmRectangleWave } from "./ElmRectangleWave";

export interface ElmBlockFallbackCSSVariables {
  "--height"?: Property.Height;
}

export interface ElmBlockFallbackProps {
  style?: React.CSSProperties & ElmBlockFallbackCSSVariables;

  /**
   * Specifies the height of the fallback container.
   */
  height?: Property.Height;
}

export const ElmBlockFallback = (props: ElmBlockFallbackProps) => {
  const { height = "16rem", style } = props;

  return (
    <div
      className={styles["block-fallback"]}
      style={{ "--height": height, ...style } as React.CSSProperties}
    >
      <ElmDotLoadingIcon />
      <ElmRectangleWave />
    </div>
  );
};
