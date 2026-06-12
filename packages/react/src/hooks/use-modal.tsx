import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { ElmModal } from "../components/containments/elm-modal";

export interface UseModalOptions {
  /**
   * Delay in **milliseconds** of the open/close fade animation.
   */
  delay?: number;
}

/**
 * Imperative sugar over {@link ElmModal}. Owns a single `isOpen` intent state
 * and returns `show` / `hide` / `toggle` to drive it, plus a `Modal` component
 * that renders the native `<dialog>` (open/animate/close lifecycle and timer
 * cleanup all live in `ElmModal`).
 */
export const useModal = (options: UseModalOptions = {}) => {
  // Forwarded as-is; ElmModal owns the default (and the CSS fallback matches).
  const delay = options.delay;
  const [isOpen, setIsOpen] = useState(false);

  // `isOpenRef` mirrors `isOpen` so the stable `Modal` identity below can read
  // the live intent without depending on it. A fresh component function on
  // every `isOpen` flip would make React treat `<Modal>` as a different element
  // type and remount the native `<dialog>`, breaking the showModal()/close
  // lifecycle. The ref is written only by the state mutators (never during
  // render), so React's refs rule stays satisfied.
  const isOpenRef = useRef(isOpen);

  const show = useCallback(() => {
    isOpenRef.current = true;
    setIsOpen(true);
  }, []);

  const hide = useCallback(() => {
    isOpenRef.current = false;
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    isOpenRef.current = !isOpenRef.current;
    setIsOpen(isOpenRef.current);
  }, []);

  // `delay` is animation config (rarely changes); sync it post-commit so there
  // is no ref write during render.
  const delayRef = useRef(delay);
  useEffect(() => {
    delayRef.current = delay;
  });

  // Stable component identity (empty deps). It reads the current intent from
  // refs on every render — the consumer re-renders on each setState, which
  // re-renders the `<Modal>` element and picks up the fresh values.
  const Modal = useMemo(
    () =>
      function Modal({ children }: { children?: ReactNode }) {
        return (
          <ElmModal
            isOpen={isOpenRef.current}
            delay={delayRef.current}
            onClose={hide}
          >
            {children}
          </ElmModal>
        );
      },
    [hide],
  );

  return { Modal, isOpen, show, hide, toggle };
};
