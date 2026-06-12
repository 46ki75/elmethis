import {
  $,
  component$,
  PropsOf,
  QRL,
  Slot,
  useSignal,
  useVisibleTask$,
} from "@qwik.dev/core";

import styles from "./elm-modal.module.css";

// Display/form dual-use component: intentionally does NOT adopt
// `useBindableSignal`. Modals are driven by parent state in nearly all
// callsites — including display-only confirmations and externally-triggered
// dialogs — so a plain controlled `isOpen` prop is preferred over the
// controlled/uncontrolled split.
export interface ElmModalProps extends PropsOf<"dialog"> {
  isOpen?: boolean;

  /**
   * Delay in **milliseconds** of the open/close fade. Emitted as the
   * `--elmethis-scoped-modal-delay` custom property so the stylesheet
   * transition stays in sync with the JS close timer. Defaults to `200`.
   */
  delay?: number;

  onClose$?: QRL<(event: Event, element: HTMLDialogElement) => void>;
}

export const ElmModal = component$<ElmModalProps>((props) => {
  const {
    class: className,
    isOpen: _isOpen,
    delay = 200,
    style,
    onClose$,
    ...rest
  } = props;
  const dialogRef = useSignal<HTMLDialogElement>();
  const isShown = useSignal(false);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(
    ({ track, cleanup }) => {
      track(() => props.isOpen);
      if (!dialogRef.value) return;
      if (props.isOpen) {
        dialogRef.value.showModal();
        isShown.value = true;
      } else {
        // Nothing to close if it was never opened. Without this guard, every
        // initially-closed modal arms a needless close timer on mount (and
        // calls close() on a dialog that was never showModal()'d).
        if (!isShown.value) return;
        isShown.value = false;
        const timer = setTimeout(() => {
          dialogRef.value?.close();
        }, delay);
        cleanup(() => {
          clearTimeout(timer);
        });
      }
    },
    { strategy: "document-ready" },
  );

  const handleClose = $((event: Event, element: HTMLDialogElement) => {
    onClose$?.(event, element);
  });

  return (
    <dialog
      ref={dialogRef}
      class={[
        styles["elm-modal"],
        className,
        {
          [styles["shown"]]: isShown.value,
        },
      ]}
      onClick$={handleClose}
      style={
        typeof style === "string"
          ? `${style};--elmethis-scoped-modal-delay:${delay}ms`
          : { "--elmethis-scoped-modal-delay": `${delay}ms`, ...style }
      }
      {...({ closedBy: "none" } as object)}
      {...rest}
    >
      <div onClick$={(e) => e.stopPropagation()}>
        <Slot />
      </div>
    </dialog>
  );
});
