import {
  $,
  component$,
  PropsOf,
  type CSSProperties,
  type Signal,
  Slot,
} from "@qwik.dev/core";

import styles from "./elm-toggle.module.css";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import { mdiChevronRight, mdiPlus } from "@mdi/js";
import { ElmInlineText } from "../typography/elm-inline-text";
import { useBindableSignal } from "../../hooks/use-bindable-signal";

export interface ElmToggleProps extends PropsOf<"div"> {
  /** The summary text of the toggle. */
  summary?: string;

  /** Initial open state for uncontrolled usage. */
  defaultIsOpen?: boolean;

  /** Controlled open state. When provided the parent owns the signal. */
  isOpen?: Signal<boolean>;

  monochrome?: boolean;
}

export const ElmToggle = component$<ElmToggleProps>((props) => {
  const {
    class: className,
    summary,
    style,
    monochrome,
    isOpen: isOpenProp,
    defaultIsOpen,
    ...rest
  } = props;

  const isOpen = useBindableSignal({
    signal: isOpenProp,
    defaultValue: defaultIsOpen ?? false,
  });

  return (
    <div
      class={[
        styles.toggle,
        {
          [styles.open]: isOpen.value,
        },
        className,
      ]}
      style={style as CSSProperties}
      {...rest}
    >
      <div
        class={styles.summary}
        preventdefault:click
        onClick$={$(() => (isOpen.value = !isOpen.value))}
      >
        <div class={styles["summary-left"]}>
          <span class={[styles.chevron, { [styles.open]: isOpen.value }]}>
            <ElmMdiIcon
              d={mdiChevronRight}
              color={
                monochrome ? "var(--elmethis-color-accent-muted)" : "#59b57c"
              }
              size="1rem"
            />
          </span>
          <div>
            {summary != null ? (
              <ElmInlineText>{summary}</ElmInlineText>
            ) : (
              <Slot name="summary" />
            )}
          </div>
        </div>

        <hr class={styles.divider} />

        <span class={[styles.cross, { [styles.open]: isOpen.value }]}>
          <ElmMdiIcon
            d={mdiPlus}
            size="1rem"
            color={
              monochrome
                ? "var(--elmethis-color-accent-muted)"
                : isOpen.value
                  ? "#b36472"
                  : "#59b57c"
            }
          />
        </span>
      </div>

      <div class={styles.border} />

      <div class={[styles.content, { [styles.open]: isOpen.value }]}>
        <Slot />
      </div>
    </div>
  );
});
