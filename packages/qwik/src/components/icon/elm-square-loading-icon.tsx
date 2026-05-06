import { component$, PropsOf, type CSSProperties } from "@builder.io/qwik";

import styles from "./elm-square-loading-icon.module.css";

export interface ElmSquareLoadingIconProps extends PropsOf<"div"> {
  size?: CSSProperties["width"];
  dimensions?: number;
}

export const ElmSquareLoadingIcon = component$<ElmSquareLoadingIconProps>(
  ({ class: className, style, size = "3rem", dimensions = 4, ...props }) => {
    const DURATION = 1200;
    const DELAY = DURATION / (dimensions * 3);

    return (
      <div
        class={[styles.wrapper, className]}
        style={{
          "--size": size,
          "--dimensions": dimensions,
          "--duration": `${DURATION}ms`,
          ...(style as CSSProperties),
        } as CSSProperties}
        {...props}
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
