import {
  $,
  component$,
  Slot,
  useSignal,
  type PropFunction,
} from "@builder.io/qwik";

import { ElmDotLoadingIcon } from "../icon/elm-dot-loading-icon";
import styles from "./elm-button.module.scss";

export interface ElmButtonProps {
  /**
   * Whether the button is in loading state.
   */
  loading?: boolean;

  /**
   * Whether the button is block.
   */
  block?: boolean;

  /**
   * Whether the button is disabled.
   */
  disabled?: boolean;

  color?: string;

  /**
   * Whether the button is primary.
   */
  primary?: boolean;

  /**
   * Click handler
   */
  onClick$?: PropFunction<() => void>;
}

export const ElmButton = component$<ElmButtonProps>((props) => {
  const clicked = useSignal(false);

  const handleClick = $(async () => {
    if (!props.loading && !props.disabled) {
      if (props.onClick$) {
        clicked.value = true;
        setTimeout(() => (clicked.value = false), 300);
        await props.onClick$();
      }
    }
  });

  return (
    <button
      onClick$={handleClick}
      class={[
        styles.button,
        !props.loading && !props.disabled && styles.enable,
        props.color && styles.colored,
        !props.color && !props.primary && styles.normal,
        !props.color && props.primary && styles.primary,
      ]}
      style={{
        display: props.block ? "flex" : "inline-flex",
        width: props.block ? "100%" : "auto",
        cursor: props.disabled
          ? "not-allowed"
          : props.loading
            ? "progress"
            : "pointer",
        "--opacity": props.disabled || props.loading ? 0.6 : undefined,
        "--color": props.color,
      }}
    >
      {clicked.value && <div class={styles.ripple}></div>}

      {props.loading ? (
        <ElmDotLoadingIcon size="1.5rem" />
      ) : (
        <span class={styles.flex}>
          <Slot />
        </span>
      )}

      <div class={styles["button-ornament"]}></div>
    </button>
  );
});
