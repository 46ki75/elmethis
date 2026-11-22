import { type JSX } from "@solidjs/web";
import { createMemo, For, omit } from "solid-js";
import { clsx } from "clsx";

import styles from "./elm-square-loading-icon.module.css";
import { mergeStyle } from "../../styles/merge-style";

export interface ElmSquareLoadingIconProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  size?: JSX.CSSProperties["width"];
  dimensions?: number;
}

const DURATION = 1200;

export const ElmSquareLoadingIcon = (props: ElmSquareLoadingIconProps) => {
  const rest = omit(props, "class", "style", "children", "size", "dimensions");
  const indexes = createMemo(() =>
    new Array(props.dimensions ?? 4).fill(null).map((_, index) => index),
  );

  return (
    <span
      class={clsx(styles["elm-square-loading-icon"], props.class)}
      style={mergeStyle(props.style, {
        "--elmethis-scoped-size": props.size ?? "3rem",
        "--elmethis-scoped-dimensions": props.dimensions ?? 4,
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
                    (DURATION / ((props.dimensions ?? 4) * 3)) *
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
