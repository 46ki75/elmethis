import {
  component$,
  QRL,
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
    return (
      <dialog
        class={[styles["elm-modal"], className]}
        style={style}
        open={isOpen}
        onClose$={onClose$}
      >
        a
      </dialog>
    );
  },
);
