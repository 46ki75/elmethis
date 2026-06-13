import type { CSSProperties, InjectionKey, Ref } from "vue";

/**
 * Shared state for the `ElmTabs` compound: the selected tab value, a setter,
 * and the collapse transition timing. `ElmTab` / `ElmTabPanel` `inject` this;
 * `ElmTabs` provides it. Replaces react's `createContext`.
 *
 * `selectedValue` is provided as a `Ref` (the controllable signal from
 * `ElmTabs`) so children re-render reactively when the active tab changes.
 */
export interface ElmTabsContextValue {
  selectedValue: Readonly<Ref<string>>;
  setSelectedValue: (value: string) => void;
  transitionTimingFunction: CSSProperties["transitionTimingFunction"];
}

export const ElmTabsContext: InjectionKey<ElmTabsContextValue> =
  Symbol("elm.tabs");

export const useElmTabsContext = (inject: ElmTabsContextValue | undefined) => {
  if (inject == null) {
    throw new Error("ElmTabs subcomponents must be used within <ElmTabs>");
  }
  return inject;
};
