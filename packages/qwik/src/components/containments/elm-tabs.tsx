import { $, component$, useSignal, type CSSProperties } from "@builder.io/qwik";
import type { JSXOutput } from "@builder.io/qwik";

import styles from "./elm-tabs.module.css";
import { ElmCollapse } from "./elm-collapse";

export interface ElmTabsProps {
  class?: string;

  style?: CSSProperties;

  tabLabels: JSXOutput[];
  tabContents: JSXOutput[];
}

export const ElmTabs = component$<ElmTabsProps>(
  ({ class: className, style, tabLabels, tabContents }) => {
    const selectedTabIndex = useSignal(0);

    const selectTab = $((index: number) => {
      selectedTabIndex.value = index;
    });

    return (
      <div class={[styles["elm-tabs"], className]} style={style}>
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
            <div key={index} class={styles["tab-content"]}>
              <ElmCollapse
                direction="both"
                isOpen={selectedTabIndex.value === index}
              >
                {content}
              </ElmCollapse>
            </div>
          ))}
        </div>
      </div>
    );
  },
);
