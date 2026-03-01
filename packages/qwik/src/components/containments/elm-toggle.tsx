import {
  $,
  component$,
  Slot,
  useSignal,
  useStylesScoped$,
} from "@builder.io/qwik";

import styles from "./elm-toggle.scoped.scss?inline";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import { mdiChevronRight, mdiPlus } from "@mdi/js";
import { ElmInlineText } from "../typography/elm-inline-text";

export interface ElmToggleProps {
  /**
   * The summary of the toggle.
   */
  summary?: string;
}

export const ElmToggle = component$<ElmToggleProps>(({ summary }) => {
  useStylesScoped$(styles);
  const isOpen = useSignal(false);

  const toggle = $(() => {
    isOpen.value = !isOpen.value;
  });

  return (
    <div
      class={[
        "toggle",
        {
          "toggle-open": isOpen.value,
          "toggle-closed": !isOpen.value,
        },
      ]}
    >
      <div
        class={[
          "summary",
          {
            "summary-open": isOpen.value,
            "summary-closed": !isOpen.value,
          },
        ]}
        onClick$={toggle}
      >
        <span
          class={[
            "chevron-icon",
            {
              "chevron-icon-open": isOpen.value,
              "chevron-icon-closed": !isOpen.value,
            },
          ]}
        >
          <ElmMdiIcon d={mdiChevronRight} />
        </span>

        <span class="summary-text">
          {summary ? summary : <Slot name="summary" />}
        </span>

        <span
          class={[
            "plus-icon",
            {
              "plus-icon-open": isOpen.value,
              "plus-icon-closed": !isOpen.value,
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
          "content",
          {
            "content-open": isOpen.value,
            "content-closed": !isOpen.value,
          },
        ]}
      >
        <Slot />
      </div>

      <div class="footer" onClick$={toggle}>
        <span class="footer-chevron-icon">
          <ElmMdiIcon d={mdiChevronRight} color="gray" />
        </span>
        <hr class="footer-line" />
        <span class="footer-cross-icon">
          <ElmMdiIcon d={mdiPlus} color="#c56565" />
        </span>
        <ElmInlineText>CLOSE</ElmInlineText>
        <span class="footer-cross-icon">
          <ElmMdiIcon d={mdiPlus} color="#c56565" />
        </span>
        <hr class="footer-line" />
        <span class="footer-chevron-icon">
          <ElmMdiIcon d={mdiChevronRight} color="gray" />
        </span>
      </div>
    </div>
  );
});
