import {
  createContext,
  mergeProps,
  splitProps,
  useContext,
  type Accessor,
  type JSX,
} from "solid-js";
import { clsx } from "clsx";

import { callEventHandler } from "../../primitives/call-event-handler";
import { createControllableSignal } from "../../primitives/create-controllable-signal";
import styles from "./elm-tabs.module.css";
import { ElmCollapse } from "./elm-collapse";

interface ElmTabsContextValue {
  selectedValue: Accessor<string>;
  setSelectedValue: (value: string) => void;
  transitionTimingFunction: Accessor<
    JSX.CSSProperties["transition-timing-function"]
  >;
}

const ElmTabsContext = createContext<ElmTabsContextValue>();

const useElmTabsContext = () => {
  const context = useContext(ElmTabsContext);
  if (context === undefined) {
    throw new Error("ElmTabs subcomponents must be used within <ElmTabs>");
  }
  return context;
};

export interface ElmTabsProps extends JSX.HTMLAttributes<HTMLDivElement> {
  /** Controlled selected tab value. When provided, the parent owns the value. */
  value?: string;

  /** Initial selected tab value when uncontrolled. */
  defaultValue?: string;

  /** Called when the selected tab value changes. */
  onValueChange?: (value: string) => void;

  transitionTimingFunction?: JSX.CSSProperties["transition-timing-function"];
}

export const ElmTabs = (props: ElmTabsProps) => {
  const merged = mergeProps({ transitionTimingFunction: "linear" }, props);
  const [local, rest] = splitProps(merged, [
    "class",
    "children",
    "value",
    "defaultValue",
    "onValueChange",
    "transitionTimingFunction",
  ]);
  const [selectedValue, setSelectedValue] = createControllableSignal<string>({
    value: () => local.value,
    defaultValue: () => local.defaultValue ?? "",
    onChange: (value) => local.onValueChange?.(value),
  });
  const context: ElmTabsContextValue = {
    selectedValue,
    setSelectedValue: (value) => {
      setSelectedValue(value);
    },
    transitionTimingFunction: () => local.transitionTimingFunction,
  };

  return (
    <ElmTabsContext.Provider value={context}>
      <div {...rest} class={clsx(styles["elm-tabs"], local.class)}>
        {local.children}
      </div>
    </ElmTabsContext.Provider>
  );
};

export type ElmTabListProps = JSX.HTMLAttributes<HTMLDivElement>;

export const ElmTabList = (props: ElmTabListProps) => {
  const [local, rest] = splitProps(props, ["class", "children"]);

  return (
    <div {...rest} class={clsx(styles["tab-container"], local.class)}>
      {local.children}
    </div>
  );
};

export interface ElmTabProps extends JSX.HTMLAttributes<HTMLDivElement> {
  /** Identifier matching the corresponding ElmTabPanel `value`. */
  value: string;
}

export const ElmTab = (props: ElmTabProps) => {
  const context = useElmTabsContext();
  const [local, rest] = splitProps(props, [
    "class",
    "children",
    "value",
    "onClick",
  ]);
  const handleClick: JSX.EventHandler<HTMLDivElement, MouseEvent> = (event) => {
    context.setSelectedValue(local.value);
    callEventHandler(local.onClick, event);
  };

  return (
    <div
      {...rest}
      class={clsx(
        styles.tab,
        context.selectedValue() === local.value && styles.active,
        local.class,
      )}
      onClick={handleClick}
    >
      {local.children}
    </div>
  );
};

export interface ElmTabPanelProps extends JSX.HTMLAttributes<HTMLDivElement> {
  /** Identifier matching the corresponding ElmTab `value`. */
  value: string;
}

export const ElmTabPanel = (props: ElmTabPanelProps) => {
  const context = useElmTabsContext();
  const [local, rest] = splitProps(props, ["class", "children", "value"]);

  return (
    <div {...rest} class={clsx(styles["tab-content"], local.class)}>
      <ElmCollapse
        direction="row"
        isOpen={context.selectedValue() === local.value}
        transitionTimingFunction={context.transitionTimingFunction()}
      >
        <div class={styles["tab-content-inner"]}>{local.children}</div>
      </ElmCollapse>
    </div>
  );
};
