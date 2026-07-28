import {
  $,
  component$,
  PropsOf,
  Slot,
  type CSSProperties,
  type QRL,
} from "@qwik.dev/core";

import { ElmDotLoadingIcon } from "../icon/elm-dot-loading-icon";
import styles from "./elm-button.module.css";

export interface ElmButtonProps extends PropsOf<"button"> {
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
   * Click handler
   */
  onClick$?: QRL<() => void>;
}

export const ElmButton = component$<ElmButtonProps>((props) => {
  const {
    class: className,
    onClick$,
    style,
    isLoading,
    block,
    color,
    primary,
    ...rest
  } = props;

  const handleClick = $(async () => {
    if (!props.isLoading && !props.disabled) {
      if (onClick$) {
        await onClick$();
      }
    }
  });

  return (
    <button
      onClick$={handleClick}
      class={[
        styles["elm-button"],
        !isLoading && !rest.disabled && styles.enable,
        color && styles.colored,
        !color && !primary && styles.normal,
        !color && primary && styles.primary,
        className,
      ]}
      style={
        {
          display: block ? "flex" : "inline-flex",
          width: block ? "100%" : "auto",
          cursor: rest.disabled
            ? "not-allowed"
            : isLoading
              ? "progress"
              : "pointer",
          "--elmethis-scoped-opacity":
            rest.disabled || isLoading ? 0.6 : undefined,
          "--elmethis-scoped-color": color,
          ...(style as CSSProperties),
        } as CSSProperties
      }
      {...rest}
    >
      {isLoading ? (
        <ElmDotLoadingIcon size="1.5rem" />
      ) : (
        <span class={styles.flex}>
          <Slot />
        </span>
      )}
    </button>
  );
});
