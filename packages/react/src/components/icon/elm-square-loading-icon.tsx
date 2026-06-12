import type { ComponentPropsWithoutRef, CSSProperties } from "react";
import { clsx } from "clsx";

import styles from "./elm-square-loading-icon.module.css";

export interface ElmSquareLoadingIconProps extends ComponentPropsWithoutRef<"span"> {
  size?: CSSProperties["width"];
  dimensions?: number;
}

export const ElmSquareLoadingIcon = ({
  className,
  style,
  size = "3rem",
  dimensions = 4,
  ...props
}: ElmSquareLoadingIconProps) => {
  const DURATION = 1200;
  const DELAY = DURATION / (dimensions * 3);

  return (
    <span
      className={clsx(styles["elm-square-loading-icon"], className)}
      style={
        {
          "--elmethis-scoped-size": size,
          "--elmethis-scoped-dimensions": dimensions,
          "--elmethis-scoped-duration": `${DURATION}ms`,
          ...style,
        } as CSSProperties
      }
      {...props}
    >
      {new Array(dimensions).fill(null).map((_, rowIndex) =>
        new Array(dimensions).fill(null).map((_, columnIndex) => (
          <span
            key={`${rowIndex}-${columnIndex}`}
            className={styles.square}
            style={
              {
                "--elmethis-scoped-delay": `${DELAY * (rowIndex + columnIndex)}ms`,
              } as CSSProperties
            }
          ></span>
        )),
      )}
    </span>
  );
};
