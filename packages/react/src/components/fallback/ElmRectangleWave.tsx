import React from "react";

import "@styles/global.css";
import styles from "./ElmRectangleWave.module.css";

export interface ElmRectangleWaveCSSVariables {}

export interface ElmRectangleWaveProps {
  style?: React.CSSProperties & ElmRectangleWaveCSSVariables;
}

export const ElmRectangleWave = (props: ElmRectangleWaveProps) => {
  return (
    <div
      aria-hidden
      className={styles["rectangle-wave"]}
      style={props.style}
    />
  );
};
