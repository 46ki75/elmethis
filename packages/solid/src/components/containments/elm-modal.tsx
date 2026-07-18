import {
  createEffect,
  createSignal,
  mergeProps,
  onCleanup,
  splitProps,
  type JSX,
} from "solid-js";
import { clsx } from "clsx";

import { callEventHandler } from "../../primitives/call-event-handler";
import { mergeStyle } from "../../styles/merge-style";
import styles from "./elm-modal.module.css";

export interface ElmModalProps extends Omit<
  JSX.DialogHtmlAttributes<HTMLDialogElement>,
  "onClose"
> {
  isOpen?: boolean;

  /** Delay in milliseconds of the open/close fade animation. */
  delay?: number;

  onClose?: (event: Event, element: HTMLDialogElement) => void;
}

export const ElmModal = (props: ElmModalProps) => {
  const merged = mergeProps({ delay: 200, closedby: "none" as const }, props);
  const [local, rest] = splitProps(merged, [
    "class",
    "style",
    "ref",
    "children",
    "isOpen",
    "delay",
    "onClick",
    "onCancel",
    "onClose",
  ]);
  const [isShown, setIsShown] = createSignal(false);
  let dialog: HTMLDialogElement | undefined;
  let closeTimer: ReturnType<typeof setTimeout> | undefined;

  const clearCloseTimer = () => {
    if (closeTimer === undefined) return;
    clearTimeout(closeTimer);
    closeTimer = undefined;
  };

  createEffect(() => {
    const open = Boolean(local.isOpen);
    const delay = local.delay;
    const element = dialog;

    clearCloseTimer();
    if (!element) return;

    if (open) {
      if (element.open) {
        setIsShown(true);
        return;
      }

      if (!element.isConnected || typeof element.showModal !== "function") {
        return;
      }

      try {
        element.showModal();
        setIsShown(element.open);
      } catch {
        // A forwarded native `open` state or detached dialog can reject
        // showModal(). The next prop change will retry against the live shell.
      }
      return;
    }

    if (!isShown() && !element.open) return;
    setIsShown(false);
    if (!element.open) return;

    closeTimer = setTimeout(
      () => {
        closeTimer = undefined;
        if (!local.isOpen && element.open) element.close();
      },
      Math.max(0, delay),
    );
  });

  onCleanup(clearCloseTimer);

  const handleClick: JSX.EventHandler<HTMLDialogElement, MouseEvent> = (
    event,
  ) => {
    callEventHandler(local.onClick, event);
    if (event.defaultPrevented || event.target !== event.currentTarget) return;
    local.onClose?.(event, event.currentTarget);
  };

  const handleCancel: JSX.EventHandler<HTMLDialogElement, Event> = (event) => {
    callEventHandler(local.onCancel, event);
    if (event.defaultPrevented) return;

    // Keep the dialog in the top layer while the controlled fade-out runs.
    event.preventDefault();
    local.onClose?.(event, event.currentTarget);
  };

  const handleNativeClose: JSX.EventHandler<HTMLDialogElement, Event> = (
    event,
  ) => {
    clearCloseTimer();
    setIsShown(false);

    // A form method="dialog" or imperative close can bypass controlled state.
    if (local.isOpen) local.onClose?.(event, event.currentTarget);
  };

  return (
    <dialog
      {...rest}
      ref={(element) => {
        dialog = element;
        if (typeof local.ref === "function") local.ref(element);
      }}
      class={clsx(styles["elm-modal"], isShown() && styles.shown, local.class)}
      style={mergeStyle(local.style, {
        "--elmethis-scoped-modal-delay": `${local.delay}ms`,
      })}
      onClick={handleClick}
      onCancel={handleCancel}
      onClose={handleNativeClose}
    >
      <div onClick={(event) => event.stopPropagation()}>{local.children}</div>
    </dialog>
  );
};
