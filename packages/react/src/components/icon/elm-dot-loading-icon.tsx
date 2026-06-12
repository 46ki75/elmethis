import type { ComponentPropsWithoutRef, CSSProperties } from "react";
import { clsx } from "clsx";

import styles from "./elm-dot-loading-icon.module.css";

export interface ElmDotLoadingIconProps extends ComponentPropsWithoutRef<"span"> {
  /**
   * Specifies the size of the dot.
   */
  size?: CSSProperties["width"];
}

export const ElmDotLoadingIcon = ({
  className,
  style,
  size = "4em",
  ...props
}: ElmDotLoadingIconProps) => {
  return (
    <span
      className={clsx(styles["elm-dot-loading-icon"], className)}
      style={
        {
          "--elmethis-scoped-size": size,
          ...style,
        } as CSSProperties
      }
      {...props}
    >
      <span className={styles.dot} aria-hidden="true"></span>
      <span className={styles.dot} aria-hidden="true"></span>
      <span className={styles.dot} aria-hidden="true"></span>
    </span>
  );
};
