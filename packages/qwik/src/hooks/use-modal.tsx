import { $, component$, Slot, useSignal } from "@qwik.dev/core";

import { ElmModal } from "../components/containments/elm-modal";

export interface UseModalOptions {
  /**
   * Delay in **milliseconds** of the open/close fade animation.
   */
  delay?: number;
}

/**
 * Imperative sugar over {@link ElmModal}. Owns a single `isOpen` intent signal
 * and returns `show` / `hide` / `toggle` to drive it, plus a `Modal` component
 * that renders the native `<dialog>` (open/animate/close lifecycle and timer
 * cleanup all live in `ElmModal`).
 */
export const useModal = (options: UseModalOptions = {}) => {
  // Forwarded as-is; ElmModal owns the default (and the CSS fallback matches).
  const delay = options.delay;
  const isOpen = useSignal(false);

  const show = $(() => {
    isOpen.value = true;
  });

  const hide = $(() => {
    isOpen.value = false;
  });

  const toggle = $(() => {
    isOpen.value = !isOpen.value;
  });

  const Modal = component$(() => {
    return (
      <ElmModal isOpen={isOpen.value} delay={delay} onClose$={hide}>
        <Slot />
      </ElmModal>
    );
  });

  return { Modal, isOpen, show, hide, toggle };
};
