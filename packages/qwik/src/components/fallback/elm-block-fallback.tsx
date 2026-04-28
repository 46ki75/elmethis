import { component$, type CSSProperties } from "@builder.io/qwik";

import styles from "./elm-block-fallback.module.scss";
import { ElmDotLoadingIcon } from "../icon/elm-dot-loading-icon";
import { ElmRectangleWave } from "./elm-rectangle-wave";

export interface ElmBlockFallbackProps {
  class?: string;

  style?: CSSProperties;

  height?: CSSProperties["height"];
}

export const ElmBlockFallback = component$<ElmBlockFallbackProps>(
  ({ class: className, style, height = "16rem" }) => {
    return (
      <div
        class={[styles["block-fallback"], className]}
        style={{ "--height": height, ...style }}
      >
        <ElmDotLoadingIcon />
        <ElmRectangleWave />
      </div>
    );
  },
);
