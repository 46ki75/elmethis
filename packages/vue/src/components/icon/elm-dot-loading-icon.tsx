import {
  defineComponent,
  type CSSProperties,
  type HTMLAttributes,
  type StyleValue,
} from "vue";
import { clsx } from "clsx";

import styles from "./elm-dot-loading-icon.module.css";

export interface ElmDotLoadingIconProps extends HTMLAttributes {
  /**
   * Specifies the size of the dot.
   */
  size?: CSSProperties["width"];
}

export const ElmDotLoadingIcon = defineComponent({
  name: "ElmDotLoadingIcon",
  inheritAttrs: false,
  props: {
    size: { type: String, default: "4em" },
  },
  setup(props, { attrs }) {
    return () => {
      const {
        class: className,
        style,
        ...rest
      } = attrs as Record<string, unknown>;

      return (
        <span
          class={clsx(
            styles["elm-dot-loading-icon"],
            className as string | undefined,
          )}
          style={
            [
              { "--elmethis-scoped-size": props.size } as CSSProperties,
              style as StyleValue,
            ] as StyleValue
          }
          {...rest}
        >
          <span class={styles.dot} aria-hidden="true"></span>
          <span class={styles.dot} aria-hidden="true"></span>
          <span class={styles.dot} aria-hidden="true"></span>
        </span>
      );
    };
  },
});
