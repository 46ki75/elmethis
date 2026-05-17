import {
  $,
  component$,
  PropsOf,
  Slot,
  useSignal,
  type CSSProperties,
  type QRL,
} from "@qwik.dev/core";

import { ElmDotLoadingIcon } from "../icon/elm-dot-loading-icon";
import styles from "./elm-button.module.css";

export interface ElmButtonProps extends PropsOf<"button"> {
  /**
   * Whether the button is in loading state.
   */
  loading?: boolean;

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
  const clicked = useSignal(false);
  const { class: className, onClick$, style, loading, block, color, primary, ...rest } = props;

  const handleClick = $(async () => {
    if (!props.loading && !props.disabled) {
      if (onClick$) {
        clicked.value = true;
        setTimeout(() => (clicked.value = false), 300);
        await onClick$();
      }
    }
  });

  return (
    <button
      onClick$={handleClick}
      class={[
        styles.button,
        !loading && !rest.disabled && styles.enable,
        color && styles.colored,
        !color && !primary && styles.normal,
        !color && primary && styles.primary,
        className,
      ]}
      style={{
        display: block ? "flex" : "inline-flex",
        width: block ? "100%" : "auto",
        cursor: rest.disabled
          ? "not-allowed"
          : loading
            ? "progress"
            : "pointer",
        "--opacity": rest.disabled || loading ? 0.6 : undefined,
        "--color": color,
        ...(style as CSSProperties),
      } as CSSProperties}
      {...rest}
    >
      {clicked.value && <span class={styles.ripple}></span>}

      {loading ? (
        <ElmDotLoadingIcon size="1.5rem" />
      ) : (
        <span class={styles.flex}>
          <Slot />
        </span>
      )}

      <span class={styles["button-ornament"]}></span>
    </button>
  );
});
