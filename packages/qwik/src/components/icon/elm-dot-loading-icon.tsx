import { component$, PropsOf, type CSSProperties } from "@qwik.dev/core";

import styles from "./elm-dot-loading-icon.module.css";

export interface ElmDotLoadingIconProps extends PropsOf<"span"> {
  /**
   * Specifies the size of the dot.
   */
  size?: CSSProperties["width"];
}

export const ElmDotLoadingIcon = component$<ElmDotLoadingIconProps>(
  ({ class: className, style, size = "4em", ...props }) => {
    return (
      <span
        class={[styles["elm-dot-loading-icon"], className]}
        style={
          {
            "--elmethis-scoped-size": size,
            ...(style as CSSProperties),
          } as CSSProperties
        }
        {...props}
      >
        <span class={styles.dot} aria-hidden="true"></span>
        <span class={styles.dot} aria-hidden="true"></span>
        <span class={styles.dot} aria-hidden="true"></span>
      </span>
    );
  },
);
