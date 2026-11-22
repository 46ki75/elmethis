import { type JSX } from "@solidjs/web";
import { omit } from "solid-js";
import { clsx } from "clsx";

import styles from "./elm-block-fallback.module.css";
import { mergeStyle } from "../../styles/merge-style";
import { ElmDotLoadingIcon } from "../icon/elm-dot-loading-icon";
import { ElmRectangleWave } from "./elm-rectangle-wave";

export interface ElmBlockFallbackProps extends JSX.HTMLAttributes<HTMLDivElement> {
  height?: JSX.CSSProperties["height"];
}

export const ElmBlockFallback = (props: ElmBlockFallbackProps) => {
  const rest = omit(props, "class", "style", "children", "height");

  return (
    <div
      class={clsx(styles["elm-block-fallback"], props.class)}
      style={mergeStyle(props.style, {
        "--elmethis-scoped-height": props.height ?? "16rem",
      })}
      {...rest}
    >
      <ElmDotLoadingIcon />
      <ElmRectangleWave />
    </div>
  );
};
