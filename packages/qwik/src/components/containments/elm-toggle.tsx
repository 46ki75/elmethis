import { $, component$, Slot, useSignal } from "@builder.io/qwik";

import styles from "./elm-toggle.module.scss";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import { mdiChevronRight, mdiPlus } from "@mdi/js";

export interface ElmToggleProps {
  /**
   * The summary of the toggle.
   */
  summary?: string;
}

export const ElmToggle = component$<ElmToggleProps>(({ summary }) => {
  const isOpen = useSignal(false);

  const toggle = $(() => {
    isOpen.value = !isOpen.value;
  });

  return (
    <div
      class={[
        styles["toggle"],
        {
          [styles["toggle-open"]]: isOpen.value,
          [styles["toggle-closed"]]: !isOpen.value,
        },
      ]}
    >
      <div
        class={[
          styles["summary"],
          {
            [styles["summary-open"]]: isOpen.value,
            [styles["summary-closed"]]: !isOpen.value,
          },
        ]}
        onClick$={toggle}
      >
        <span
          class={[
            styles["chevron-icon"],
            {
              [styles["chevron-icon-open"]]: isOpen.value,
              [styles["chevron-icon-closed"]]: !isOpen.value,
            },
          ]}
        >
          <ElmMdiIcon d={mdiChevronRight} />
        </span>

        <span class={styles["summary-text"]}>
          {summary ? summary : <Slot name="summary" />}
        </span>

        <span
          class={[
            styles["plus-icon"],
            {
              [styles["plus-icon-open"]]: isOpen.value,
              [styles["plus-icon-closed"]]: !isOpen.value,
            },
          ]}
        >
          <ElmMdiIcon
            d={mdiPlus}
            color={isOpen.value ? "#c56565" : "#59b57c"}
            size="1rem"
          />
        </span>
      </div>

      <div
        class={[
          styles["content"],
          {
            [styles["content-open"]]: isOpen.value,
            [styles["content-closed"]]: !isOpen.value,
          },
        ]}
      >
        <Slot />
      </div>
    </div>
  );
});
