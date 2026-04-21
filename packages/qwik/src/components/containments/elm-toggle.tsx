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
}

export const ElmToggle = component$<ElmToggleProps>(
  ({ class: className, summary, style, isOpen: isOpenProp, setIsOpen$ }) => {
    const isOpen = useSignal(isOpenProp ?? false);

    useTask$(({ track }) => {
      track(() => isOpenProp);
      if (isOpenProp !== undefined) {
        isOpen.value = isOpenProp;
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
              <ElmMdiIcon d={mdiChevronRight} color="#59b57c" size="1rem" />
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
              color={isOpen.value ? "#b36472" : "#59b57c"}
            />
          </span>
        </div>

        <div class={styles.border} />

        <div class={styles.content}>
          <Slot />
        </div>
      </div>
    );
  },
);
