import {
  $,
  component$,
  noSerialize,
  NoSerialize,
  Slot,
  useSignal,
} from "@builder.io/qwik";

import styles from "./useModal.module.css";

export interface UseModalOptions {
  /**
   * Delay in **milliseconds** before the modal is completely hidden after hiding animation starts.
   */
  delay?: number;
}

/**
 * ## show
 * 1. Cancel any pending hide timer
 * 2. `isOpen = true`
 * 3. `isShown = true`
 *
 * ## hide
 * 1. `isShown = false`
 * 2. `setTimeout(() => { isOpen = false }, delay)`
 */
export const useModal = ({ delay = 200 }: UseModalOptions) => {
  const isOpen = useSignal(false);
  const isShown = useSignal(false);
  const hideTimer =
    useSignal<NoSerialize<ReturnType<typeof setTimeout>> | null>(null);

  const show = $(() => {
    if (hideTimer.value != null) {
      clearTimeout(hideTimer.value);
      hideTimer.value = null;
    }
    isOpen.value = true;
    isShown.value = true;
  });

  const hide = $(() => {
    isShown.value = false;
    hideTimer.value = noSerialize(
      setTimeout(() => {
        isOpen.value = false;
        hideTimer.value = null;
      }, delay),
    );
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
