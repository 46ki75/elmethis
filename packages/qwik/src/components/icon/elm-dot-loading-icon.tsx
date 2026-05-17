import { component$, PropsOf, type CSSProperties } from "@qwik.dev/core";

import styles from "./elm-dot-loading-icon.module.css";

export interface ElmDotLoadingIconProps extends PropsOf<"span"> {
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
  ({ class: className, style, size = "4em", color = "#606875", ...props }) => {
    return (
      <span
        class={[styles.wrapper, className]}
        style={{
          "--size": size,
          "--color": color,
          ...(style as CSSProperties),
        } as CSSProperties}
        {...props}
      >
        <span class={styles.dot} aria-hidden="true"></span>
        <span class={styles.dot} aria-hidden="true"></span>
        <span class={styles.dot} aria-hidden="true"></span>
      </span>
    );
  },
);
