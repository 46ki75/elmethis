import { createSignal, onCleanup, Show, splitProps, type JSX } from "solid-js";
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
  const [local, rest] = splitProps(props, [
    "class",
    "style",
    "onClick",
    "isLoading",
    "block",
    "color",
    "primary",
    "disabled",
    "children",
  ]);
  const [clicked, setClicked] = createSignal(false);
  let timer: ReturnType<typeof setTimeout> | undefined;

  onCleanup(() => clearTimeout(timer));

  const handleClick: JSX.EventHandler<HTMLButtonElement, MouseEvent> = (
    event,
  ) => {
    if (local.isLoading || local.disabled || !local.onClick) return;

    setClicked(true);
    clearTimeout(timer);
    timer = setTimeout(() => setClicked(false), 300);
    callEventHandler(local.onClick, event);
  };

  return (
    <button
      {...rest}
      onClick={handleClick}
      disabled={local.disabled}
      class={clsx(
        styles["elm-button"],
        !local.isLoading && !local.disabled && styles.enable,
        local.color && styles.colored,
        !local.color && !local.primary && styles.normal,
        !local.color && local.primary && styles.primary,
        local.class,
      )}
      style={mergeStyle(local.style, {
        display: local.block ? "flex" : "inline-flex",
        width: local.block ? "100%" : "auto",
        cursor: local.disabled
          ? "not-allowed"
          : local.isLoading
            ? "progress"
            : "pointer",
        "--elmethis-scoped-opacity":
          local.disabled || local.isLoading ? 0.6 : undefined,
        "--elmethis-scoped-color": local.color,
      })}
    >
      <Show when={clicked()}>
        <span class={styles.ripple} />
      </Show>
      <Show
        when={!local.isLoading}
        fallback={<ElmDotLoadingIcon size="1.5rem" />}
      >
        <span class={styles.flex}>{local.children}</span>
      </Show>
    </button>
  );
};
