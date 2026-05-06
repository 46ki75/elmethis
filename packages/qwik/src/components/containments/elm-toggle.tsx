import {
  $,
  component$,
  PropsOf,
  type CSSProperties,
  type PropFunction,
  Slot,
  useComputed$,
} from "@builder.io/qwik";

import styles from "./elm-toggle.module.css";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import { mdiChevronRight, mdiPlus } from "@mdi/js";
import { ElmInlineText } from "../typography/elm-inline-text";
import { useControllableState } from "../../hooks/use-controllable-state";

export interface ElmToggleProps extends PropsOf<"div"> {
  /** The summary text of the toggle. */
  summary?: string;

  /** Initial open state for uncontrolled usage. */
  defaultIsOpen?: boolean;

  /** Controlled open state. When provided the parent owns the state. */
  isOpen?: boolean;

  /** Called when the open state changes. */
  setIsOpen$?: PropFunction<(value: boolean) => void>;

  monochrome?: boolean;
}

export const ElmToggle = component$<ElmToggleProps>((props) => {
  const { class: className, summary, style, monochrome, isOpen: _isOpenProp, defaultIsOpen, setIsOpen$, ...rest } = props;

  const [isOpen, setIsOpen] = useControllableState({
    prop: useComputed$(() => props.isOpen),
    defaultProp: defaultIsOpen ?? false,
    onChange: setIsOpen$,
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
        onClick$={$(() => setIsOpen(!isOpen.value))}
      >
        <div class={styles["summary-left"]}>
          <span class={[styles.chevron, { [styles.open]: isOpen.value }]}>
            <ElmMdiIcon
              d={mdiChevronRight}
              color={monochrome ? "#868e9c" : "#59b57c"}
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
              monochrome ? "#868e9c" : isOpen.value ? "#b36472" : "#59b57c"
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
