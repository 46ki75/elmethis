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
 * 1. `hideGen++` (invalidates any pending hide timeout)
 * 2. `isOpen = true`
 * 3. `isShown = true`
 *
 * ## hide
 * 1. `isShown = false`
 * 2. `setTimeout(() => { if gen matches: isOpen = false }, delay)`
 */
export const useModal = ({ delay = 200 }: UseModalOptions) => {
  const isOpen = useSignal(false);
  const isShown = useSignal(false);
  const hideGen = useSignal(0);

  const show = $(() => {
    hideGen.value++;
    isOpen.value = true;
    isShown.value = true;
  });

  const hide = $(() => {
    const gen = ++hideGen.value;
    isShown.value = false;
    setTimeout(() => {
      if (hideGen.value === gen) {
        isOpen.value = false;
      }
    }, delay);
  });

  const toggle = $(() => {
    if (isShown.value) {
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
