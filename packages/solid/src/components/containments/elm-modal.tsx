import { createEffect, createSignal, omit } from "solid-js";
import type { JSX } from "@solidjs/web";
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
  const rest = omit(
    props,
    "class",
    "style",
    "ref",
    "children",
    "isOpen",
    "delay",
    "onClick",
    "onCancel",
    "onClose",
    "closedby",
  );
  const delay = () => props.delay ?? 200;
  const [isShown, setIsShown] = createSignal(false);
  let dialog: HTMLDialogElement | undefined;
  let closeTimer: ReturnType<typeof setTimeout> | undefined;

  const clearCloseTimer = () => {
    if (closeTimer === undefined) {
      return;
    }
    clearTimeout(closeTimer);
    closeTimer = undefined;
  };

  createEffect(
    () => ({ open: Boolean(props.isOpen), delay: delay() }),
    ({ open, delay }) => {
      const element = dialog;
      if (!element) {
        return undefined;
      }

      if (open) {
        if (element.open) {
          setIsShown(true);
        } else if (
          element.isConnected &&
          typeof element.showModal === "function"
        ) {
          try {
            element.showModal();
            setIsShown(element.open);
          } catch {
            // A forwarded native `open` state or detached dialog can reject
            // showModal(). The next prop change will retry against the live shell.
          }
        }
        return undefined;
      }

      setIsShown(false);
      if (!element.open) {
        return undefined;
      }

      closeTimer = setTimeout(
        () => {
          closeTimer = undefined;
          if (!props.isOpen && element.open) {
            element.close();
          }
        },
        Math.max(0, delay),
      );
      return clearCloseTimer;
    },
  );

  const handleClick: JSX.EventHandler<HTMLDialogElement, MouseEvent> = (
    event,
  ) => {
    callEventHandler(props.onClick, event);
    if (event.defaultPrevented || event.target !== event.currentTarget) {
      return;
    }
    props.onClose?.(event, event.currentTarget);
  };

  const handleCancel: JSX.EventHandler<HTMLDialogElement, Event> = (event) => {
    callEventHandler(props.onCancel, event);
    if (event.defaultPrevented) {
      return;
    }

    // Keep the dialog in the top layer while the controlled fade-out runs.
    event.preventDefault();
    props.onClose?.(event, event.currentTarget);
  };

  const handleNativeClose: JSX.EventHandler<HTMLDialogElement, Event> = (
    event,
  ) => {
    clearCloseTimer();
    setIsShown(false);

    // A form method="dialog" or imperative close can bypass controlled state.
    if (props.isOpen) {
      props.onClose?.(event, event.currentTarget);
    }
  };

  return (
    <dialog
      {...rest}
      ref={[
        (element) => {
          dialog = element;
        },
        props.ref,
      ]}
      class={clsx(styles["elm-modal"], isShown() && styles.shown, props.class)}
      style={mergeStyle(props.style, {
        "--elmethis-scoped-modal-delay": `${delay()}ms`,
      })}
      closedby={props.closedby ?? "none"}
      onClick={handleClick}
      onCancel={handleCancel}
      onClose={handleNativeClose}
    >
      <div onClick={(event) => event.stopPropagation()}>{props.children}</div>
    </dialog>
  );
};
