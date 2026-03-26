import { $, component$, JSXOutput, QRL, useSignal } from "@builder.io/qwik";

import styles from "./elm-tabs.module.css";

export interface ElmTabsProps {
  renderTabFunctions$: QRL<() => JSXOutput>[];
  renderTabContentFunctions$: QRL<() => JSXOutput>[];
}

export const ElmTabs = component$<ElmTabsProps>(
  ({ renderTabFunctions$, renderTabContentFunctions$ }) => {
    const selectedTabIndex = useSignal(0);

    const selectTab = $((index: number) => {
      selectedTabIndex.value = index;
    });

    return (
      <div class={styles["elm-tabs"]}>
        <div class={styles["tab-container"]}>
          {renderTabFunctions$.map((renderTabFunction$, index) => (
            <div
              key={index}
              class={[
                styles["tab"],
                {
                  [styles["active"]]: selectedTabIndex.value === index,
                },
              ]}
              onClick$={() => selectTab(index)}
            >
              {renderTabFunction$()}
            </div>
          ))}
        </div>

        <div class={styles["tab-content-container"]}>
          <div key={selectedTabIndex.value} class={styles["tab-content"]}>
            {renderTabContentFunctions$[selectedTabIndex.value]()}
          </div>
        </div>
      </div>
    );
  },
);
