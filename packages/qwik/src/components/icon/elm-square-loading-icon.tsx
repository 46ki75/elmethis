import { component$, CSSProperties } from "@builder.io/qwik";

import styles from "./elm-square-loading-icon.module.scss";

export interface ElmSquareLoadingIconProps {
  size?: CSSProperties["width"];
  dimensions?: number;
}

export const ElmSquareLoadingIcon = component$<ElmSquareLoadingIconProps>(
  ({ size = "3rem", dimensions = 4 }) => {
    const DURATION = 1200;
    const DELAY = DURATION / (dimensions * 3);

    return (
      <div
        class={styles.wrapper}
        style={{
          "--size": size,
          "--dimensions": dimensions,
          "--duration": `${DURATION}ms`,
        }}
      >
        {new Array(dimensions)
          .fill(null)
          .map((_, rowIndex) =>
            new Array(dimensions)
              .fill(null)
              .map((_, columnIndex) => (
                <div
                  key={`${rowIndex}-${columnIndex}`}
                  class={styles.square}
                  style={{ "--delay": `${DELAY * (rowIndex + columnIndex)}ms` }}
                ></div>
              )),
          )}
      </div>
    );
  },
);
