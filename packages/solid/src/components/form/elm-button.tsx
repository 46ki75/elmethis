import { Show, omit } from "solid-js";
import type { JSX } from "@solidjs/web";
import { clsx } from "clsx";

import { callEventHandler } from "../../primitives/call-event-handler";
import { mergeStyle } from "../../styles/merge-style";
import { ElmDotLoadingIcon } from "../icon/elm-dot-loading-icon";
import styles from "./elm-button.module.css";

export interface ElmButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Whether the button is in loading state. */
  isLoading?: boolean;

  /** Whether the button fills its container. */
  block?: boolean;

  color?: string;

  /** Whether the button uses the primary variant. */
  primary?: boolean;
}

export const ElmButton = (props: ElmButtonProps) => {
  const rest = omit(
    props,
    "class",
    "style",
    "onClick",
    "isLoading",
    "block",
    "color",
    "primary",
    "disabled",
    "children",
  );

  const handleClick: JSX.EventHandler<HTMLButtonElement, MouseEvent> = (
    event,
  ) => {
    if (props.isLoading || props.disabled || !props.onClick) {
      return;
    }

    callEventHandler(props.onClick, event);
  };

  return (
    <button
      {...rest}
      onClick={handleClick}
      disabled={props.disabled}
      class={clsx(
        styles["elm-button"],
        !props.isLoading && !props.disabled && styles.enable,
        props.color && styles.colored,
        !props.color && !props.primary && styles.normal,
        !props.color && props.primary && styles.primary,
        props.class,
      )}
      style={mergeStyle(props.style, {
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
      })}
    >
      <Show
        when={!props.isLoading}
        fallback={<ElmDotLoadingIcon size="1.5rem" />}
      >
        <span class={styles.flex}>{props.children}</span>
      </Show>
    </button>
  );
};
