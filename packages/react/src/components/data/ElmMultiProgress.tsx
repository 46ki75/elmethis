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
    let cumulative = 0;
    return progress.map((p) => {
      const scale = (p.value / max) * 100;
      const start = cumulative;
      cumulative += scale;
      return { ...p, scale: scale / 100, start };
    });
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
