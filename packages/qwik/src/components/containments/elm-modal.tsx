import {
  $,
  component$,
  QRL,
  Slot,
  useSignal,
  useVisibleTask$,
  type CSSProperties,
} from "@builder.io/qwik";

import styles from "./elm-modal.module.css";

export interface ElmModalProps {
  class?: string;

  style?: CSSProperties;

  isOpen?: boolean;

  onClose$?: QRL<(event: Event, element: HTMLDialogElement) => void>;
}

export const ElmModal = component$<ElmModalProps>(
  ({ class: className, style, isOpen, onClose$ }) => {
    const dialogRef = useSignal<HTMLDialogElement>();
    const isShown = useSignal(false);

    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(({ track, cleanup }) => {
      track(() => isOpen);
      if (!dialogRef.value) return;
      if (isOpen) {
        dialogRef.value.showModal();
        isShown.value = true;
      } else {
        isShown.value = false;
        const timer = setTimeout(() => {
          dialogRef.value?.close();
        }, 200);
        cleanup(() => {
          clearTimeout(timer);
        });
      }
    });

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
        style={style}
        onClick$={handleClose}
        closedBy="none"
      >
        <div onClick$={(e) => e.stopPropagation()}>
          <Slot />
        </div>
      </dialog>
    );
  },
);
