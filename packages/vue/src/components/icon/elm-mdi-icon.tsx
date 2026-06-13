import {
  defineComponent,
  type CSSProperties,
  type SVGAttributes,
  type StyleValue,
} from "vue";
import { clsx } from "clsx";

import styles from "./elm-mdi-icon.module.css";

export interface ElmMdiIconProps extends /* @vue-ignore */ SVGAttributes {
  /**
   * The SVG path data (the `d` attribute) — typically an `@mdi/js` icon.
   */
  d: string;

  /**
   * The width/height of the icon (both axes). Defaults to `1em`.
   */
  size?: string;

  /**
   * The fill color. Defaults to `currentColor`. Seeds both the light and dark
   * scoped color vars unless `lightColor` / `darkColor` override them.
   */
  color?: string;

  /**
   * Overrides the fill in the light color scheme.
   */
  lightColor?: string;

  /**
   * Overrides the fill in the dark color scheme.
   */
  darkColor?: string;
}

export const ElmMdiIcon = defineComponent({
  name: "ElmMdiIcon",
  inheritAttrs: false,
  props: {
    d: { type: String, required: true },
    size: { type: String, default: "1em" },
    color: { type: String, default: "currentColor" },
    lightColor: { type: String, default: undefined },
    darkColor: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    return () => {
      const {
        class: className,
        style,
        ...rest
      } = attrs as Record<string, unknown>;

      return (
        <svg
          class={clsx(styles["elm-mdi-icon"], className as string | undefined)}
          style={
            [
              {
                "--elmethis-scoped-color": props.lightColor ?? props.color,
                "--dark-color": props.darkColor ?? props.color,
              } as CSSProperties,
              // Incoming style wins over the scoped vars, matching the qwik/
              // react spread order.
              style as StyleValue,
            ] as StyleValue
          }
          width={props.size}
          height={props.size}
          viewBox="0 0 24 24"
          fill={props.color}
          xmlns="http://www.w3.org/2000/svg"
          focusable="false"
          role="img"
          {...rest}
        >
          <path d={props.d} />
        </svg>
      );
    };
  },
});
