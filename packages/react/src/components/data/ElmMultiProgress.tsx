import React, { useMemo } from "react";

import "@styles/global.css";
import styles from "./ElmMultiProgress.module.css";

export interface ElmMultiProgressCSSVariables {
  "--weight"?: React.CSSProperties["height"];
  "--border-radius"?: string;
}

export interface ElmMultiProgressProps {
  style?: React.CSSProperties & ElmMultiProgressCSSVariables;

  /**
   * The progress segments to display.
   */
  progress: Array<{
    /**
     * The current value of the progress.
     */
    value: number;

    /**
     * The color of the progress.
     */
    color: string;
  }>;

  /**
   * The weight of the progress.
   */
  weight?: React.CSSProperties["height"];

  /**
   * Whether the progress should be round.
   */
  round?: boolean;
}

export const ElmMultiProgress = ({
  progress,
  weight = "4px",
  round = true,
  style,
}: ElmMultiProgressProps) => {
  const computedProgress = useMemo(() => {
    const max = progress.reduce((p, n) => p + n.value, 0);
    const scales = progress.map((p) => (p.value / max) * 100);
    return progress.map((p, i) => ({
      ...p,
      scale: scales[i] / 100,
      start: scales.slice(0, i).reduce((a, b) => a + b, 0),
    }));
  }, [progress]);

  return (
    <div
      className={styles.container}
      style={{
        "--weight": weight,
        "--border-radius": round
          ? "calc(var(--weight) / 2)"
          : undefined,
        ...style,
      } as React.CSSProperties}
    >
      {computedProgress.map((p, index) => (
        <div
          key={index}
          className={styles.bar}
          style={{
            "--transform": `translateX(${p.start}%) scaleX(${p.scale})`,
            "--color": p.color,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};
