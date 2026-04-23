import { $, component$, Slot, useSignal } from "@builder.io/qwik";

import styles from "./useModal.module.css";

export interface UseModalOptions {
  /**
   * Delay in **milliseconds** before the modal is completely hidden after hiding animation starts.
   */
  delay?: number;
}

/**
 * ## show
 * 1. `isOpen = true`
 * 2. `isShow = true`
 *
 * ## hide
 * 1. `isShow = false`
 * 2. `setTimeout(() => { isOpen = false }, delay)`
 */
export const useModal = ({ delay = 200 }: UseModalOptions) => {
  const isOpen = useSignal(false);
  const isShown = useSignal(false);

  const show = $(() => {
    isOpen.value = true;
    isShown.value = true;
  });

  const hide = $(() => {
    isShown.value = false;
    setTimeout(() => {
      isOpen.value = false;
    }, delay);
  });

  const toggle = $(() => {
    if (isOpen.value) {
      hide();
    } else {
      show();
    }
  });

  const Modal = component$(() => {
    return (
      <div
        class={[
          styles["use-modal"],
          {
            [styles["open"]]: isShown.value,
          },
        ]}
        style={{ "--delay": `${delay}ms` }}
        onClick$={hide}
      >
        {isOpen.value && (
          <div
            role="dialog"
            onClick$={(e) => {
              e.stopPropagation();
            }}
          >
            {<Slot />}
          </div>
        )}
      </div>
    );
  });

  return { Modal, isOpen, isShown, show, hide, toggle };
};
