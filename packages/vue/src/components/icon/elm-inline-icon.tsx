import { defineComponent, type HTMLAttributes } from "vue";
import { clsx } from "clsx";

import styles from "./elm-inline-icon.module.css";

export interface ElmInlineIconProps extends HTMLAttributes {
  /**
   * The source URL of the icon.
   */
  src: string;

  /**
   * The alt text for the icon.
   */
  alt?: string;

  width?: number | `${number}`;

  height?: number | `${number}`;

  size?: number | `${number}`;
}

export const ElmInlineIcon = defineComponent({
  name: "ElmInlineIcon",
  inheritAttrs: false,
  props: {
    src: { type: String, required: true },
    alt: { type: String, default: undefined },
    width: { type: [Number, String], default: undefined },
    height: { type: [Number, String], default: undefined },
    size: { type: [Number, String], default: 16 },
  },
  setup(props, { attrs }) {
    return () => {
      const { class: className, ...rest } = attrs as Record<string, unknown>;
      return (
        <span
          class={clsx(
            styles["elm-inline-icon"],
            className as string | undefined,
          )}
          {...rest}
        >
          <img
            src={props.src}
            alt={props.alt}
            class={styles["elm-inline-icon"]}
            width={props.width ?? props.size}
            height={props.height ?? props.size}
          />
        </span>
      );
    };
  },
});
