import {
  $,
  component$,
  noSerialize,
  Slot,
  useSignal,
  useTask$,
  type NoSerialize,
} from "@qwik.dev/core";

import styles from "./use-modal.module.css";

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
  // Track the most recent hide timer so it can be cancelled on unmount.
  // Without this, hide()'s pending setTimeout fires after the host has been
  // torn down, writing to a disposed signal.
  const hideTimerId = useSignal<
    NoSerialize<ReturnType<typeof setTimeout>> | undefined
  >(undefined);

  // Unmount-only cleanup: clear any pending hide timer.
  useTask$(({ cleanup }) => {
    cleanup(() => {
      if (hideTimerId.value !== undefined) clearTimeout(hideTimerId.value);
    });
  });

  const show = $(() => {
    hideGen.value++;
    isOpen.value = true;
    isShown.value = true;
  });

  const hide = $(() => {
    const gen = ++hideGen.value;
    isShown.value = false;
    hideTimerId.value = noSerialize(
      setTimeout(() => {
        if (hideGen.value === gen) {
          isOpen.value = false;
        }
        hideTimerId.value = undefined;
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
          <div role="dialog" stoppropagation:click>
            {<Slot />}
          </div>
        )}
      </div>
    );
  });

  return { Modal, isOpen, isShown, show, hide, toggle };
};
