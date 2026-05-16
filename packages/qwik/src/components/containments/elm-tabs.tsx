import {
  $,
  component$,
  createContextId,
  PropsOf,
  Slot,
  useContext,
  useContextProvider,
  type CSSProperties,
  type Signal,
} from "@qwik.dev/core";

import styles from "./elm-tabs.module.css";
import { ElmCollapse } from "./elm-collapse";
import { useControllableSignal } from "../../hooks/use-controllable-signal";

interface ElmTabsContextValue {
  selectedValue: Signal<string>;
  transitionTimingFunction: CSSProperties["transition-timing-function"];
}

const ElmTabsContext =
  createContextId<ElmTabsContextValue>("elmethis.tabs");

export interface ElmTabsProps extends PropsOf<"div"> {
  /**
   * Controlled selected tab value. When provided, the parent owns the signal.
   */
  value?: Signal<string>;

  /**
   * Initial selected tab value when uncontrolled.
   */
  defaultValue?: string;

  transitionTimingFunction?: CSSProperties["transition-timing-function"];
}

export const ElmTabs = component$<ElmTabsProps>((props) => {
  const {
    class: className,
    value,
    defaultValue,
    transitionTimingFunction = "linear",
    ...rest
  } = props;

  const selectedValue = useControllableSignal<string>({
    signal: value,
    defaultValue: defaultValue ?? "",
  });

  useContextProvider(ElmTabsContext, {
    selectedValue,
    transitionTimingFunction,
  });

  return (
    <div class={[styles["elm-tabs"], className]} {...rest}>
      <Slot />
    </div>
  );
});

export type ElmTabListProps = PropsOf<"div">;

export const ElmTabList = component$<ElmTabListProps>(
  ({ class: className, ...rest }) => (
    <div class={[styles["tab-container"], className]} {...rest}>
      <Slot />
    </div>
  ),
);

export interface ElmTabProps extends PropsOf<"div"> {
  /** Identifier matching the corresponding ElmTabPanel `value`. */
  value: string;
}

export const ElmTab = component$<ElmTabProps>((props) => {
  const { value, class: className, ...rest } = props;
  const ctx = useContext(ElmTabsContext);
  const onClick$ = $(() => {
    ctx.selectedValue.value = value;
  });
  return (
    <div
      class={[
        styles["tab"],
        { [styles["active"]]: ctx.selectedValue.value === value },
        className,
      ]}
      onClick$={onClick$}
      {...rest}
    >
      <Slot />
    </div>
  );
});

export interface ElmTabPanelProps extends PropsOf<"div"> {
  /** Identifier matching the corresponding ElmTab `value`. */
  value: string;
}

export const ElmTabPanel = component$<ElmTabPanelProps>((props) => {
  const { value, class: className, ...rest } = props;
  const ctx = useContext(ElmTabsContext);
  return (
    <div class={[styles["tab-content"], className]} {...rest}>
      <ElmCollapse
        direction="row"
        isOpen={ctx.selectedValue.value === value}
        transitionTimingFunction={ctx.transitionTimingFunction}
      >
        <div class={styles["tab-content-inner"]}>
          <Slot />
        </div>
      </ElmCollapse>
    </div>
  );
});
