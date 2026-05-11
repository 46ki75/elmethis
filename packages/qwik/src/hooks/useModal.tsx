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
        /**
         * Closes the modal only when the backdrop itself is clicked directly.
         * Checking `e.target === e.currentTarget` instead of relying on
         * `stopPropagation()` in the dialog, because Qwik's document-level
         * event delegation collects the full event path before any handler runs,
         * making `stopPropagation()` ineffective for preventing parent handlers.
         */
        onClick$={(e) => {
          if (e.target === e.currentTarget) {
            hide();
          }
        }}
      >
        {isOpen.value && (
          <div role="dialog">
            {<Slot />}
          </div>
        )}
      </div>
    );
  });

  return { Modal, isOpen, isShown, show, hide, toggle };
};
