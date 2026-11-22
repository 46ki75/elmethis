import { createContext, omit, useContext, type Accessor } from "solid-js";
import type { JSX } from "@solidjs/web";
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
  const rest = omit(
    props,
    "class",
    "children",
    "value",
    "defaultValue",
    "onValueChange",
    "transitionTimingFunction",
  );
  const [selectedValue, setSelectedValue] = createControllableSignal<string>({
    value: () => props.value,
    defaultValue: () => props.defaultValue ?? "",
    onChange: (value) => props.onValueChange?.(value),
  });
  const context: ElmTabsContextValue = {
    selectedValue,
    setSelectedValue: (value) => {
      setSelectedValue(value);
    },
    transitionTimingFunction: () => props.transitionTimingFunction ?? "linear",
  };

  return (
    <ElmTabsContext value={context}>
      <div {...rest} class={clsx(styles["elm-tabs"], props.class)}>
        {props.children}
      </div>
    </ElmTabsContext>
  );
};

export type ElmTabListProps = JSX.HTMLAttributes<HTMLDivElement>;

export const ElmTabList = (props: ElmTabListProps) => {
  const rest = omit(props, "class", "children");

  return (
    <div {...rest} class={clsx(styles["tab-container"], props.class)}>
      {props.children}
    </div>
  );
};

export interface ElmTabProps extends JSX.HTMLAttributes<HTMLDivElement> {
  /** Identifier matching the corresponding ElmTabPanel `value`. */
  value: string;
}

export const ElmTab = (props: ElmTabProps) => {
  const context = useElmTabsContext();
  const rest = omit(props, "class", "children", "value", "onClick");
  const handleClick: JSX.EventHandler<HTMLDivElement, MouseEvent> = (event) => {
    context.setSelectedValue(props.value);
    callEventHandler(props.onClick, event);
  };

  return (
    <div
      {...rest}
      class={clsx(
        styles.tab,
        context.selectedValue() === props.value && styles.active,
        props.class,
      )}
      onClick={handleClick}
    >
      {props.children}
    </div>
  );
};

export interface ElmTabPanelProps extends JSX.HTMLAttributes<HTMLDivElement> {
  /** Identifier matching the corresponding ElmTab `value`. */
  value: string;
}

export const ElmTabPanel = (props: ElmTabPanelProps) => {
  const context = useElmTabsContext();
  const rest = omit(props, "class", "children", "value");

  return (
    <div {...rest} class={clsx(styles["tab-content"], props.class)}>
      <ElmCollapse
        direction="row"
        isOpen={context.selectedValue() === props.value}
        transitionTimingFunction={context.transitionTimingFunction()}
      >
        <div class={styles["tab-content-inner"]}>{props.children}</div>
      </ElmCollapse>
    </div>
  );
};
