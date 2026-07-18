import { createMemo, For, mergeProps, splitProps, type JSX } from "solid-js";
import { clsx } from "clsx";

import styles from "./elm-square-loading-icon.module.css";
import { mergeStyle } from "../../styles/merge-style";

export interface ElmSquareLoadingIconProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  size?: JSX.CSSProperties["width"];
  dimensions?: number;
}

const DURATION = 1200;

export const ElmSquareLoadingIcon = (props: ElmSquareLoadingIconProps) => {
  const merged = mergeProps({ size: "3rem", dimensions: 4 }, props);
  const [local, rest] = splitProps(merged, [
    "class",
    "style",
    "children",
    "size",
    "dimensions",
  ]);
  const indexes = createMemo(() =>
    new Array(local.dimensions).fill(null).map((_, index) => index),
  );

  return (
    <span
      class={clsx(styles["elm-square-loading-icon"], local.class)}
      style={mergeStyle(local.style, {
        "--elmethis-scoped-size": local.size,
        "--elmethis-scoped-dimensions": local.dimensions,
        "--elmethis-scoped-duration": `${DURATION}ms`,
      })}
      {...rest}
    >
      <For each={indexes()}>
        {(rowIndex) => (
          <For each={indexes()}>
            {(columnIndex) => (
              <span
                class={styles.square}
                style={{
                  "--elmethis-scoped-delay": `${
                    (DURATION / (local.dimensions * 3)) *
                    (rowIndex + columnIndex)
                  }ms`,
                }}
              />
            )}
          </For>
        )}
      </For>
    </span>
  );
};
