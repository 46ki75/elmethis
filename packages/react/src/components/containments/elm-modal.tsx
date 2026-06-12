import {
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type MouseEvent,
} from "react";
import { clsx } from "clsx";

import styles from "./elm-modal.module.css";

// Display/form dual-use component: intentionally does NOT adopt a
// controlled/uncontrolled split (e.g. `useControllableState`). Modals are
// driven by parent state in nearly all callsites — including display-only
// confirmations and externally-triggered dialogs — so a plain controlled
// `isOpen` prop is preferred.
export interface ElmModalProps extends Omit<
  ComponentPropsWithoutRef<"dialog">,
  "onClose"
> {
  isOpen?: boolean;

  /**
   * Delay in **milliseconds** of the open/close fade. Emitted as the
   * `--elmethis-scoped-modal-delay` custom property so the stylesheet
   * transition stays in sync with the JS close timer. Defaults to `200`.
   */
  delay?: number;

  onClose?: (event: Event, element: HTMLDialogElement) => void;
}

export const ElmModal = ({
  className,
  isOpen,
  delay = 200,
  style,
  onClose,
  children,
  ...rest
}: ElmModalProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isShown, setIsShown] = useState(false);

  // Synchronizes the native <dialog> with the controlled `isOpen` prop. The
  // setState calls here are intentional and must run inside the effect: the
  // `shown` fade class can only flip *after* the imperative `showModal()` /
  // close-timer runs against a real DOM ref. Mirrors the qwik twin's
  // `useVisibleTask$`.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen) {
      dialog.showModal();
      setIsShown(true);
    } else {
      // Nothing to close if it was never opened. Without this guard, every
      // initially-closed modal arms a needless close timer on mount (and
      // calls close() on a dialog that was never showModal()'d).
      if (!isShown) return;
      setIsShown(false);
      const timer = setTimeout(() => {
        dialogRef.current?.close();
      }, delay);
      return () => {
        clearTimeout(timer);
      };
    }
    // `isShown` is read but intentionally not tracked: it mirrors `isOpen`
    // and re-running on its change would re-arm the close timer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, delay]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleClose = (event: MouseEvent<HTMLDialogElement>) => {
    if (dialogRef.current) {
      onClose?.(event.nativeEvent, dialogRef.current);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className={clsx(
        styles["elm-modal"],
        isShown && styles["shown"],
        className,
      )}
      onClick={handleClose}
      style={
        {
          "--elmethis-scoped-modal-delay": `${delay}ms`,
          ...style,
        } as CSSProperties
      }
      {...({ closedby: "none" } as object)}
      {...rest}
    >
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </dialog>
  );
};
