import {
  defineComponent,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type CSSProperties,
  type DialogHTMLAttributes,
  type PropType,
  type StyleValue,
} from "vue";
import { clsx } from "clsx";

import styles from "./elm-modal.module.css";

// Display/form dual-use component: intentionally does NOT adopt a
// controlled/uncontrolled split (e.g. `useBindableSignal`). Modals are driven
// by parent state in nearly all callsites — including display-only
// confirmations and externally-triggered dialogs — so a plain controlled
// `isOpen` prop is preferred.
export interface ElmModalProps extends Omit<DialogHTMLAttributes, "onClose"> {
  isOpen?: boolean;

  /**
   * Delay in **milliseconds** of the open/close fade. Emitted as the
   * `--elmethis-scoped-modal-delay` custom property so the stylesheet
   * transition stays in sync with the JS close timer. Defaults to `200`.
   */
  delay?: number;

  onClose?: (event: Event, element: HTMLDialogElement) => void;
}

export const ElmModal = defineComponent({
  name: "ElmModal",
  inheritAttrs: false,
  props: {
    isOpen: { type: Boolean, default: undefined },
    delay: { type: Number, default: 200 },
    onClose: {
      type: Function as PropType<
        (event: Event, element: HTMLDialogElement) => void
      >,
      default: undefined,
    },
  },
  setup(props, { attrs, slots }) {
    const dialogRef = ref<HTMLDialogElement | null>(null);
    const isShown = ref(false);
    let closeTimer: ReturnType<typeof setTimeout> | undefined;

    // Synchronizes the native <dialog> with the controlled `isOpen` prop. The
    // `shown` fade class can only flip *after* the imperative `showModal()` /
    // close-timer runs against the real DOM ref. Mirrors the qwik twin's
    // `useVisibleTask$` / react's mount effect.
    const sync = (open: boolean | undefined, delay: number): void => {
      const dialog = dialogRef.value;
      if (!dialog) return;
      // Clear any pending close before re-evaluating (covers rapid toggles).
      if (closeTimer !== undefined) {
        clearTimeout(closeTimer);
        closeTimer = undefined;
      }
      if (open) {
        dialog.showModal();
        isShown.value = true;
      } else {
        // Nothing to close if it was never opened — without this guard an
        // initially-closed modal would close() a dialog never showModal()'d.
        if (!isShown.value) return;
        isShown.value = false;
        closeTimer = setTimeout(() => {
          dialogRef.value?.close();
        }, delay);
      }
    };

    onMounted(() => sync(props.isOpen, props.delay));
    watch([() => props.isOpen, () => props.delay], ([open, delay]) =>
      sync(open, delay),
    );
    onBeforeUnmount(() => {
      if (closeTimer !== undefined) clearTimeout(closeTimer);
    });

    const handleClose = (event: Event): void => {
      if (dialogRef.value) {
        props.onClose?.(event, dialogRef.value);
      }
    };

    return () => {
      const {
        class: className,
        style,
        ...rest
      } = attrs as Record<string, unknown>;

      return (
        <dialog
          ref={dialogRef}
          class={clsx(
            styles["elm-modal"],
            isShown.value && styles["shown"],
            className as string | undefined,
          )}
          onClick={handleClose}
          style={
            [
              {
                "--elmethis-scoped-modal-delay": `${props.delay}ms`,
              } as CSSProperties,
              style as StyleValue,
            ] as StyleValue
          }
          {...({ closedby: "none" } as Record<string, string>)}
          {...rest}
        >
          <div onClick={(e: Event) => e.stopPropagation()}>
            {slots.default?.()}
          </div>
        </dialog>
      );
    };
  },
});
