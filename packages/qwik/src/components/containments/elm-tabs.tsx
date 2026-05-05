import {
  $,
  component$,
  useComputed$,
  type CSSProperties,
  type PropFunction,
} from "@builder.io/qwik";
import type { JSXOutput } from "@builder.io/qwik";

import styles from "./elm-tabs.module.css";
import { ElmCollapse } from "./elm-collapse";
import { useControllableState } from "../../hooks/use-controllable-state";

export interface ElmTabsProps {
  class?: string;

  style?: CSSProperties;

  tabs: Array<{
    label: JSXOutput;
    content: JSXOutput;
  }>;

  /**
   * Controlled selected tab index. When provided the parent owns the state.
   */
  selectedTabIndex?: number;

  /**
   * Initial selected tab index when uncontrolled.
   * @default 0
   */
  defaultSelectedTabIndex?: number;

  /**
   * Called whenever the selected tab changes.
   */
  onSelectedTabIndexChange$?: PropFunction<(index: number) => void>;
}

export const ElmTabs = component$<ElmTabsProps>((props) => {
  const { class: className, style, tabs } = props;

  const [selectedTabIndex, setSelectedTabIndex] = useControllableState({
    prop: useComputed$(() => props.selectedTabIndex),
    defaultProp: props.defaultSelectedTabIndex ?? 0,
    onChange: props.onSelectedTabIndexChange$,
  });

  return (
    <div class={[styles["elm-tabs"], className]} style={style}>
      <div class={styles["tab-container"]}>
        {tabs.map(({ label }, index) => (
          <div
            key={index}
            class={[
              styles["tab"],
              {
                [styles["active"]]: selectedTabIndex.value === index,
              },
            ]}
            onClick$={$(() => setSelectedTabIndex(index))}
          >
            {label}
          </div>
        ))}
      </div>

      <div class={styles["tab-content-container"]}>
        {tabs.map(({ content }, index) => (
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
});
