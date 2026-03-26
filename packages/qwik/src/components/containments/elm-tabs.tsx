import { $, component$, useSignal } from "@builder.io/qwik";
import type { JSXOutput } from "@builder.io/qwik";

import styles from "./elm-tabs.module.css";

export interface ElmTabsProps {
  tabLabels: JSXOutput[];
  tabContents: JSXOutput[];
}

export const ElmTabs = component$<ElmTabsProps>(
  ({ tabLabels, tabContents }) => {
    const selectedTabIndex = useSignal(0);

    const selectTab = $((index: number) => {
      selectedTabIndex.value = index;
    });

    return (
      <div class={styles["elm-tabs"]}>
        <div class={styles["tab-container"]}>
          {tabLabels.map((tabLabel, index) => (
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
              {tabLabel}
            </div>
          ))}
        </div>

        <div class={styles["tab-content-container"]}>
          {tabContents.map((content, index) => (
            <div
              key={index}
              class={[
                styles["tab-content"],
                {
                  [styles["active"]]: selectedTabIndex.value === index,
                },
              ]}
            >
              {content}
            </div>
          ))}
        </div>
      </div>
    );
  },
);
