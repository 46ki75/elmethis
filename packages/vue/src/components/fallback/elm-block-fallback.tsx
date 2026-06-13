import { defineComponent, type CSSProperties, type HTMLAttributes } from "vue";
import { clsx } from "clsx";

import styles from "./elm-block-fallback.module.css";
import { ElmDotLoadingIcon } from "../icon/elm-dot-loading-icon";
import { ElmRectangleWave } from "./elm-rectangle-wave";

export interface ElmBlockFallbackProps extends HTMLAttributes {
  height?: CSSProperties["height"];
}

export const ElmBlockFallback = defineComponent({
  name: "ElmBlockFallback",
  props: {
    // Rich csstype value rides the exported interface only; the runtime prop
    // stays a plain String to avoid the deep-union (TS2883) instantiation.
    height: { type: String, default: "16rem" },
  },
  setup(props) {
    // inheritAttrs default: passthrough class/style merge onto the root.
    return () => (
      <div
        class={clsx(styles["elm-block-fallback"])}
        style={{ "--elmethis-scoped-height": props.height } as CSSProperties}
      >
        <ElmDotLoadingIcon />
        <ElmRectangleWave />
      </div>
    );
  },
});
