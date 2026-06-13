import { defineComponent, type CSSProperties, type HTMLAttributes } from "vue";
import { clsx } from "clsx";

import styles from "./elm-collapse.module.css";

export interface ElmCollapseProps extends HTMLAttributes {
  isOpen?: boolean;

  direction?: "row" | "column" | "both";

  transitionTimingFunction?: CSSProperties["transitionTimingFunction"];
}

export const ElmCollapse = defineComponent({
  name: "ElmCollapse",
  props: {
    isOpen: { type: Boolean, default: undefined },
    direction: {
      type: String as () => "row" | "column" | "both",
      default: "row",
    },
    // Rich csstype value rides the exported interface only; the runtime prop
    // stays a plain String to avoid the deep-union (TS2883) instantiation.
    transitionTimingFunction: { type: String, default: "ease-in-out" },
  },
  setup(props, { slots }) {
    // Fallthrough class/style merge with the bindings below (inheritAttrs default).
    return () => (
      <div
        class={clsx(
          styles["elm-collapse"],
          props.isOpen && styles["open"],
          props.direction === "row" && styles["row"],
          props.direction === "column" && styles["column"],
          props.direction === "both" && styles["both"],
        )}
        style={
          {
            "--elmethis-scoped-transition-timing-function":
              props.transitionTimingFunction,
          } as CSSProperties
        }
      >
        <div class={styles["inner"]}>{slots.default?.()}</div>
      </div>
    );
  },
});
