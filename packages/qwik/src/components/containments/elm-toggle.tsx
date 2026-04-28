import {
  $,
  component$,
  type CSSProperties,
  type PropFunction,
  Slot,
  useSignal,
  useTask$,
} from "@builder.io/qwik";

import styles from "./elm-toggle.module.scss";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import { mdiChevronRight, mdiPlus } from "@mdi/js";
import { ElmInlineText } from "../typography/elm-inline-text";

export interface ElmToggleProps {
  class?: string;

  style?: CSSProperties & { "--elmethis-margin-block-start"?: string };

  /** The summary text of the toggle. */
  summary?: string;

  /** Whether the toggle is open. */
  isOpen?: boolean;

  /** Called when the toggle open state changes. */
  setIsOpen$?: PropFunction<(value: boolean) => void>;

  monochrome?: boolean;
}

export const ElmToggle = component$<ElmToggleProps>((props) => {
  const { class: className, summary, style, setIsOpen$, monochrome } = props;
  const isOpen = useSignal(props.isOpen ?? false);

  useTask$(({ track }) => {
    const value = track(() => props.isOpen);
    if (value !== undefined) {
      isOpen.value = value;
    }
  });

  const handleClick = $(async () => {
    const next = !isOpen.value;
    isOpen.value = next;
    if (setIsOpen$) await setIsOpen$(next);
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
      style={style}
    >
      <div class={styles.summary} preventdefault:click onClick$={handleClick}>
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
