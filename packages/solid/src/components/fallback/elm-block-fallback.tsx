import { mergeProps, splitProps, type JSX } from "solid-js";
import { clsx } from "clsx";

import styles from "./elm-block-fallback.module.css";
import { mergeStyle } from "../../styles/merge-style";
import { ElmDotLoadingIcon } from "../icon/elm-dot-loading-icon";
import { ElmRectangleWave } from "./elm-rectangle-wave";

export interface ElmBlockFallbackProps extends JSX.HTMLAttributes<HTMLDivElement> {
  height?: JSX.CSSProperties["height"];
}

export const ElmBlockFallback = (props: ElmBlockFallbackProps) => {
  const merged = mergeProps({ height: "16rem" }, props);
  const [local, rest] = splitProps(merged, [
    "class",
    "style",
    "children",
    "height",
  ]);

  return (
    <div
      class={clsx(styles["elm-block-fallback"], local.class)}
      style={mergeStyle(local.style, {
        "--elmethis-scoped-height": local.height,
      })}
      {...rest}
    >
      <ElmDotLoadingIcon />
      <ElmRectangleWave />
    </div>
  );
};
