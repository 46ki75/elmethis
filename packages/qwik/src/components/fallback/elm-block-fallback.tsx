import { component$, CSSProperties, useStylesScoped$ } from "@builder.io/qwik";

import styles from "./elm-block-fallback.scoped.scss?inline";
import { ElmDotLoadingIcon } from "../icon/elm-dot-loading-icon";
import { ElmRectangleWave } from "./elm-rectangle-wave";

export interface ElmBlockFallbackProps {
  height?: CSSProperties["height"];
}

export const ElmBlockFallback = component$<ElmBlockFallbackProps>(
  ({ height = "16rem" }) => {
    useStylesScoped$(styles);
    return (
      <div class="block-fallback" style={{ "--height": height }}>
        <ElmDotLoadingIcon />
        <ElmRectangleWave />
      </div>
    );
  },
);
