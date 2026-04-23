import {
  component$,
  QRL,
  useSignal,
  useTask$,
  type CSSProperties,
} from "@builder.io/qwik";

import styles from "./elm-modal.module.css";

export interface ElmModalProps {
  class?: string;

  style?: CSSProperties;

  isOpen?: boolean;

  onClose$?: QRL<(event: Event, element: HTMLDialogElement) => void>;

  /**
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog#closerequest}
   * @default "any"
   */
  closedBy?: "any" | "closerequest" | "none";
}

export const ElmModal = component$<ElmModalProps>(
  ({ class: className, style, isOpen, onClose$, closedBy = "any" }) => {
    const dialogRef = useSignal<HTMLDialogElement>();

    useTask$(({ track }) => {
      track(() => isOpen);
      const dialog = dialogRef.value;
      if (!dialog) return;
      if (isOpen) {
        dialog.showModal();
      } else {
        dialog.close();
      }
    });

    return (
      <dialog
        ref={dialogRef}
        class={[styles["elm-modal"], className]}
        style={style}
        onClose$={onClose$}
        closedBy={closedBy}
      >
        a
      </dialog>
    );
  },
);
