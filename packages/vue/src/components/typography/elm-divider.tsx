import { defineComponent, type HTMLAttributes } from "vue";
import { clsx } from "clsx";

import styles from "./elm-divider.module.css";

export type ElmDividerProps = HTMLAttributes;

export const ElmDivider = defineComponent({
  name: "ElmDivider",
  // Take full control of attribute inheritance so a consumer-supplied `class`
  // is merged with the component's own root class instead of duplicated.
  inheritAttrs: false,
  setup(_, { attrs }) {
    return () => {
      const { class: className, ...rest } = attrs as Record<string, unknown>;
      return (
        <hr
          class={clsx(styles["elm-divider"], className as string | undefined)}
          {...rest}
        />
      );
    };
  },
});
