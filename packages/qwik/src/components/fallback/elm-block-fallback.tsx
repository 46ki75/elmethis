import { component$, PropsOf, type CSSProperties } from "@builder.io/qwik";

import styles from "./elm-block-fallback.module.css";
import { ElmDotLoadingIcon } from "../icon/elm-dot-loading-icon";
import { ElmRectangleWave } from "./elm-rectangle-wave";

export interface ElmBlockFallbackProps extends PropsOf<"div"> {
  height?: CSSProperties["height"];
}

export const ElmBlockFallback = component$<ElmBlockFallbackProps>(
  ({ class: className, style, height = "16rem", ...props }) => {
    return (
      <div
        class={[styles["block-fallback"], className]}
        style={{ "--height": height, ...(style as CSSProperties) } as CSSProperties}
        {...props}
      >
        <ElmDotLoadingIcon />
        <ElmRectangleWave />
      </div>
    );
  },
);
