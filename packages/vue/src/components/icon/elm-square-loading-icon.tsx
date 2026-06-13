import {
  defineComponent,
  type CSSProperties,
  type HTMLAttributes,
  type StyleValue,
} from "vue";
import { clsx } from "clsx";

import styles from "./elm-square-loading-icon.module.css";

export interface ElmSquareLoadingIconProps extends HTMLAttributes {
  size?: CSSProperties["width"];
  dimensions?: number;
}

export const ElmSquareLoadingIcon = defineComponent({
  name: "ElmSquareLoadingIcon",
  inheritAttrs: false,
  props: {
    size: { type: String, default: "3rem" },
    dimensions: { type: Number, default: 4 },
  },
  setup(props, { attrs }) {
    return () => {
      const {
        class: className,
        style,
        ...rest
      } = attrs as Record<string, unknown>;

      const DURATION = 1200;
      const DELAY = DURATION / (props.dimensions * 3);

      const cells = [];
      for (let rowIndex = 0; rowIndex < props.dimensions; rowIndex++) {
        for (
          let columnIndex = 0;
          columnIndex < props.dimensions;
          columnIndex++
        ) {
          cells.push(
            <span
              key={`${rowIndex}-${columnIndex}`}
              class={styles.square}
              style={
                {
                  "--elmethis-scoped-delay": `${DELAY * (rowIndex + columnIndex)}ms`,
                } as CSSProperties
              }
            ></span>,
          );
        }
      }

      return (
        <span
          class={clsx(
            styles["elm-square-loading-icon"],
            className as string | undefined,
          )}
          style={
            [
              {
                "--elmethis-scoped-size": props.size,
                "--elmethis-scoped-dimensions": props.dimensions,
                "--elmethis-scoped-duration": `${DURATION}ms`,
              } as CSSProperties,
              style as StyleValue,
            ] as StyleValue
          }
          {...rest}
        >
          {cells}
        </span>
      );
    };
  },
});
