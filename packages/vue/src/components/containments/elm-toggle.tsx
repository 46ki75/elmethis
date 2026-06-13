import { defineComponent, type HTMLAttributes } from "vue";
import { clsx } from "clsx";
import { mdiChevronRight, mdiPlus } from "@mdi/js";

import styles from "./elm-toggle.module.css";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import { ElmInlineText } from "../typography/elm-inline-text";
import { useBindableSignal } from "../../hooks/use-bindable-signal";

export interface ElmToggleProps extends Omit<HTMLAttributes, "onToggle"> {
  /**
   * The summary text of the toggle. A `string` is wrapped in `ElmInlineText`;
   * otherwise the `summary` slot is rendered.
   */
  summary?: string;

  /** Initial open state for uncontrolled usage. */
  defaultIsOpen?: boolean;

  /** Controlled open state. Bind with `v-model:is-open`; when provided the
   * parent owns the value (prop `isOpen` + `update:isOpen` event). */
  isOpen?: boolean;

  monochrome?: boolean;
}

export const ElmToggle = defineComponent({
  name: "ElmToggle",
  props: {
    summary: { type: String, default: undefined },
    defaultIsOpen: { type: Boolean, default: false },
    isOpen: { type: Boolean, default: undefined },
    monochrome: { type: Boolean, default: false },
  },
  emits: ["update:isOpen"],
  setup(props, { emit, slots }) {
    const isOpen = useBindableSignal({
      props,
      key: "isOpen",
      emit,
      defaultValue: props.defaultIsOpen ?? false,
    });

    // inheritAttrs default: passthrough class/style merge onto the root.
    return () => (
      <div class={clsx(styles["elm-toggle"], isOpen.value && styles.open)}>
        <div
          class={styles.summary}
          onClick={(event: MouseEvent) => {
            event.preventDefault();
            isOpen.value = !isOpen.value;
          }}
        >
          <div class={styles["summary-left"]}>
            <span class={clsx(styles.chevron, isOpen.value && styles.open)}>
              <ElmMdiIcon
                d={mdiChevronRight}
                color={
                  props.monochrome
                    ? "var(--elmethis-color-neutral-weak)"
                    : "var(--elmethis-color-primary)"
                }
                size="1rem"
              />
            </span>
            <div>
              {props.summary != null ? (
                <ElmInlineText>{props.summary}</ElmInlineText>
              ) : (
                slots.summary?.()
              )}
            </div>
          </div>

          <hr class={styles.divider} />

          <span class={clsx(styles.cross, isOpen.value && styles.open)}>
            <ElmMdiIcon
              d={mdiPlus}
              size="1rem"
              color={
                props.monochrome
                  ? "var(--elmethis-color-neutral-weak)"
                  : isOpen.value
                    ? "var(--elmethis-color-accent-error)"
                    : "var(--elmethis-color-primary)"
              }
            />
          </span>
        </div>

        <div class={styles.border} />

        <div class={clsx(styles.content, isOpen.value && styles.open)}>
          {slots.default?.()}
        </div>
      </div>
    );
  },
});
