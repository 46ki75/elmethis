import { defineComponent, ref, type Component, type Ref } from "vue";

import { ElmModal } from "../components/containments/elm-modal";

export interface UseModalOptions {
  /**
   * Delay in **milliseconds** of the open/close fade animation.
   */
  delay?: number;
}

/**
 * Imperative sugar over {@link ElmModal}. Owns a single `isOpen` intent and
 * returns `show` / `hide` / `toggle` to drive it, plus a `Modal` component that
 * renders the native `<dialog>` (open/animate/close lifecycle and timer cleanup
 * all live in `ElmModal`).
 *
 * Unlike the react twin, no stable-identity ref hack is needed: a composable
 * runs once in `setup`, so `Modal` is created once and reads the reactive
 * `isOpen` by closure.
 */
export const useModal = (
  options: UseModalOptions = {},
): {
  Modal: Component;
  isOpen: Ref<boolean>;
  show: () => void;
  hide: () => void;
  toggle: () => void;
} => {
  const isOpen = ref(false);

  const show = (): void => {
    isOpen.value = true;
  };
  const hide = (): void => {
    isOpen.value = false;
  };
  const toggle = (): void => {
    isOpen.value = !isOpen.value;
  };

  const Modal = defineComponent({
    name: "Modal",
    setup(_, { slots }) {
      return () => (
        <ElmModal isOpen={isOpen.value} delay={options.delay} onClose={hide}>
          {slots.default?.()}
        </ElmModal>
      );
    },
  });

  return { Modal, isOpen, show, hide, toggle };
};
