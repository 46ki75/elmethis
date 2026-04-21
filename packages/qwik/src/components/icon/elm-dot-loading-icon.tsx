import { component$, type CSSProperties } from "@builder.io/qwik";

import styles from "./elm-dot-loading-icon.module.scss";

export interface ElmDotLoadingIconProps {
  class?: string;

  style?: CSSProperties;

  /**
   * Specifies the color of the dot.
   *
   * e.g.) `'red'`, `'#ff0000'`, `'rgba(255, 0, 0, 0.5)'`
   */
  color?: CSSProperties["backgroundColor"];

  /**
   * Specifies the size of the dot.
   */
  size?: CSSProperties["width"];
}

export const ElmDotLoadingIcon = component$<ElmDotLoadingIconProps>(
  ({ class: className, style, size = "4em", color = "#606875" }) => {
    return (
      <div
        class={[styles.wrapper, className]}
        style={{
          "--size": size,
          "--color": color,
          ...style,
        }}
      >
        <div class={styles.dot} aria-hidden="true"></div>
        <div class={styles.dot} aria-hidden="true"></div>
        <div class={styles.dot} aria-hidden="true"></div>
      </div>
    );
  },
);
