import { component$, CSSProperties } from "@builder.io/qwik";

import styles from "./elm-block-fallback.module.scss";
import { ElmDotLoadingIcon } from "../icon/elm-dot-loading-icon";
import { ElmRectangleWave } from "./elm-rectangle-wave";

export interface ElmBlockFallbackProps {
  height?: CSSProperties["height"];
}

export const ElmBlockFallback = component$<ElmBlockFallbackProps>(
  ({ height = "16rem" }) => {
    return (
      <div class={styles["block-fallback"]} style={{ "--height": height }}>
        <ElmDotLoadingIcon />
        <ElmRectangleWave />
      </div>
    );
  },
);
