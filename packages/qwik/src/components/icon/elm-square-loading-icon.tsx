import { component$, PropsOf, type CSSProperties } from "@qwik.dev/core";

import styles from "./elm-square-loading-icon.module.css";

export interface ElmSquareLoadingIconProps extends PropsOf<"span"> {
  size?: CSSProperties["width"];
  dimensions?: number;
}

export const ElmSquareLoadingIcon = component$<ElmSquareLoadingIconProps>(
  ({ class: className, style, size = "3rem", dimensions = 4, ...props }) => {
    const DURATION = 1200;
    const DELAY = DURATION / (dimensions * 3);

    return (
      <span
        class={[styles["elm-square-loading-icon"], className]}
        style={
          {
            "--elmethis-scoped-size": size,
            "--elmethis-scoped-dimensions": dimensions,
            "--elmethis-scoped-duration": `${DURATION}ms`,
            ...(style as CSSProperties),
          } as CSSProperties
        }
        {...props}
      >
        {new Array(dimensions).fill(null).map((_, rowIndex) =>
          new Array(dimensions).fill(null).map((_, columnIndex) => (
            <span
              key={`${rowIndex}-${columnIndex}`}
              class={styles.square}
              style={{
                "--elmethis-scoped-delay": `${DELAY * (rowIndex + columnIndex)}ms`,
              }}
            ></span>
          )),
        )}
      </span>
    );
  },
);
