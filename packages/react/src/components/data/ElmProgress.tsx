import React from "react";

import "@styles/global.css";
import styles from "./ElmProgress.module.css";

export interface ElmProgressCSSVariables {
  "--weight"?: React.CSSProperties["height"];
  "--border-radius"?: string;
  "--color"?: string;
}

export interface ElmProgressProps {
  style?: React.CSSProperties & ElmProgressCSSVariables;

  className?: string;

  /**
   * The current value of the progress.
   */
  value: number;

  /**
   * The buffer value of the progress.
   */
  buffer?: number;

  /**
   * The maximum value of the progress.
   */
  max?: number;

  /**
   * The weight of the progress.
   */
  weight?: React.CSSProperties["height"];

  /**
   * Whether the progress should be round.
   */
  round?: boolean;

  /**
   * The color of the progress.
   */
  color?: string;

  /**
   * Whether the progress is loading.
   */
  loading?: boolean;
}

export const ElmProgress = ({
  value,
  buffer,
  max = 100,
  weight = "4px",
  round = true,
  color,
  loading = false,
  style,
  className,
}: ElmProgressProps) => {
  return (
    <>
      <progress className={styles.progress} value={value} max={max} />

      <div
        className={[styles.container, className].filter(Boolean).join(" ")}
        style={
          {
            "--weight": weight,
            "--border-radius": round ? "calc(var(--weight) / 2)" : undefined,
            "--color": color,
            ...style,
          } as React.CSSProperties
        }
      >
        <div
          className={styles.value}
          style={
            {
              "--scale-x": `scaleX(${loading ? 0 : value / max})`,
            } as React.CSSProperties
          }
        />

        {loading && <div className={styles.loading} />}

        <div
          className={styles.buffer}
          style={
            {
              "--scale-x": `scaleX(${loading ? 0 : buffer != null ? buffer / max : value / max})`,
            } as React.CSSProperties
          }
        />
      </div>
    </>
  );
};
