import {
  defineComponent,
  ref,
  type CSSProperties,
  type HTMLAttributes,
  type StyleValue,
} from "vue";
import { clsx } from "clsx";

import { ElmDotLoadingIcon } from "../icon/elm-dot-loading-icon";
import styles from "./elm-button.module.css";

export interface ElmButtonProps extends HTMLAttributes {
  /**
   * Whether the button is in loading state.
   */
  isLoading?: boolean;

  /**
   * Whether the button is block.
   */
  block?: boolean;

  color?: string;

  /**
   * Whether the button is primary.
   */
  primary?: boolean;

  /**
   * Whether the button is disabled.
   */
  disabled?: boolean;
}

export const ElmButton = defineComponent({
  name: "ElmButton",
  // The consumer's `onClick` is intercepted (ripple + loading/disabled guard),
  // so attrs are split manually instead of falling through.
  inheritAttrs: false,
  props: {
    isLoading: { type: Boolean, default: false },
    block: { type: Boolean, default: false },
    color: { type: String, default: undefined },
    primary: { type: Boolean, default: false },
    disabled: { type: Boolean, default: undefined },
  },
  setup(props, { attrs, slots }) {
    const clicked = ref(false);

    return () => {
      const {
        class: className,
        style,
        onClick,
        ...rest
      } = attrs as Record<string, unknown>;

      const handleClick = (event: MouseEvent): void => {
        if (!props.isLoading && !props.disabled) {
          if (typeof onClick === "function") {
            clicked.value = true;
            setTimeout(() => (clicked.value = false), 300);
            (onClick as (event: MouseEvent) => void)(event);
          }
        }
      };

      return (
        <button
          onClick={handleClick}
          disabled={props.disabled}
          class={clsx(
            styles["elm-button"],
            !props.isLoading && !props.disabled && styles.enable,
            props.color && styles.colored,
            !props.color && !props.primary && styles.normal,
            !props.color && props.primary && styles.primary,
            className as string | undefined,
          )}
          style={
            [
              {
                display: props.block ? "flex" : "inline-flex",
                width: props.block ? "100%" : "auto",
                cursor: props.disabled
                  ? "not-allowed"
                  : props.isLoading
                    ? "progress"
                    : "pointer",
                "--elmethis-scoped-opacity":
                  props.disabled || props.isLoading ? 0.6 : undefined,
                "--elmethis-scoped-color": props.color,
              } as CSSProperties,
              style as StyleValue,
            ] as StyleValue
          }
          {...rest}
        >
          {clicked.value && <span class={styles.ripple}></span>}

          {props.isLoading ? (
            <ElmDotLoadingIcon size="1.5rem" />
          ) : (
            <span class={styles.flex}>{slots.default?.()}</span>
          )}
        </button>
      );
    };
  },
});
