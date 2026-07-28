import { defineComponent, type SVGAttributes, type StyleValue } from "vue";
import { clsx } from "clsx";

import styles from "./elm-mdi-icon.module.css";

export type ElmMdiIconProps = Omit<SVGAttributes, "children"> & {
  /**
   * The SVG path data, typically imported from `@mdi/js`.
   */
  path: string;

  /**
   * The width/height of the icon (both axes). Defaults to `1em`.
   */
  size?: string | number;

  /**
   * The CSS color used by the icon's `currentColor` fill.
   */
  color?: string;

  /**
   * The accessible label. Omit it for decorative icons.
   */
  label?: string;
};

export const ElmMdiIcon = defineComponent({
  name: "ElmMdiIcon",
  inheritAttrs: false,
  props: {
    path: { type: String, required: true },
    size: { type: [String, Number], default: "1em" },
    color: { type: String, default: undefined },
    label: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    return () => {
      const {
        class: className,
        style,
        ...rest
      } = attrs as Record<string, unknown>;
      const hasAccessibleName = Boolean(
        props.label || rest["aria-label"] || rest["aria-labelledby"],
      );

      return (
        <svg
          class={clsx(styles["elm-mdi-icon"], className as string | undefined)}
          style={style as StyleValue}
          width={props.size}
          height={props.size}
          viewBox="0 0 24 24"
          color={props.color}
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          focusable="false"
          aria-hidden={hasAccessibleName ? undefined : "true"}
          role={hasAccessibleName ? "img" : undefined}
          {...rest}
        >
          {props.label && <title>{props.label}</title>}
          <path d={props.path} />
        </svg>
      );
    };
  },
});
