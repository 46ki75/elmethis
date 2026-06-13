import { defineComponent, type HTMLAttributes, type StyleValue } from "vue";
import { clsx } from "clsx";

import styles from "./elm-paragraph.module.css";
import textStyles from "../../styles/text.module.css";

export interface ElmParagraphProps extends HTMLAttributes {
  color?: string;

  backgroundColor?: string;
}

export const ElmParagraph = defineComponent({
  name: "ElmParagraph",
  inheritAttrs: false,
  props: {
    color: { type: String, default: undefined },
    backgroundColor: { type: String, default: undefined },
  },
  setup(props, { attrs, slots }) {
    return () => {
      const {
        class: className,
        style,
        ...rest
      } = attrs as Record<string, unknown>;

      return (
        <p
          class={clsx(
            styles["elm-paragraph"],
            textStyles.text,
            className as string | undefined,
          )}
          style={
            [
              style as StyleValue,
              {
                "--elmethis-scoped-color": props.color,
                "--elmethis-scoped-background-color": props.backgroundColor,
              },
            ] as StyleValue
          }
          {...rest}
        >
          {slots.default?.()}
        </p>
      );
    };
  },
});
