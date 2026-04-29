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

    const handleTabClick = $((_event: MouseEvent, el: HTMLElement) => {
      const idx = el.getAttribute("data-tab-index");
      selectedTabIndex.value = idx !== null ? parseInt(idx, 10) : 0;
    });

    return (
      <div class={[styles["elm-tabs"], className]} style={style}>
        <div class={styles["tab-container"]}>
          {tabLabels.map((tabLabel, index) => (
            <div
              key={index}
              data-tab-index={String(index)}
              class={[
                styles["tab"],
                {
                  [styles["active"]]: selectedTabIndex.value === index,
                },
              ]}
              onClick$={handleTabClick}
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
