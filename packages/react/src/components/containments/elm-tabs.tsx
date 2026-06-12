import {
  createContext,
  useContext,
  type ComponentPropsWithoutRef,
  type CSSProperties,
} from "react";
import { clsx } from "clsx";

import styles from "./elm-tabs.module.css";
import { ElmCollapse } from "./elm-collapse";
import { useBindableSignal } from "../../hooks/use-bindable-signal";

interface ElmTabsContextValue {
  selectedValue: string;
  setSelectedValue: (value: string) => void;
  transitionTimingFunction: CSSProperties["transitionTimingFunction"];
}

const ElmTabsContext = createContext<ElmTabsContextValue | null>(null);

const useElmTabsContext = () => {
  const ctx = useContext(ElmTabsContext);
  if (ctx == null) {
    throw new Error("ElmTabs subcomponents must be used within <ElmTabs>");
  }
  return ctx;
};

export interface ElmTabsProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Controlled selected tab value. When provided, the parent owns the value.
   */
  value?: string;

  /**
   * Initial selected tab value when uncontrolled.
   */
  defaultValue?: string;

  /**
   * Called when the selected tab value changes.
   */
  onValueChange?: (value: string) => void;

  transitionTimingFunction?: CSSProperties["transitionTimingFunction"];
}

export const ElmTabs = ({
  className,
  value,
  defaultValue,
  onValueChange,
  transitionTimingFunction = "linear",
  children,
  ...rest
}: ElmTabsProps) => {
  const [selectedValue, setSelectedValue] = useBindableSignal<string>({
    value,
    defaultValue: defaultValue ?? "",
    onChange: onValueChange,
  });

  return (
    <ElmTabsContext.Provider
      value={{ selectedValue, setSelectedValue, transitionTimingFunction }}
    >
      <div className={clsx(styles["elm-tabs"], className)} {...rest}>
        {children}
      </div>
    </ElmTabsContext.Provider>
  );
};

export type ElmTabListProps = ComponentPropsWithoutRef<"div">;

export const ElmTabList = ({
  className,
  children,
  ...rest
}: ElmTabListProps) => (
  <div className={clsx(styles["tab-container"], className)} {...rest}>
    {children}
  </div>
);

export interface ElmTabProps extends ComponentPropsWithoutRef<"div"> {
  /** Identifier matching the corresponding ElmTabPanel `value`. */
  value: string;
}

export const ElmTab = ({
  value,
  className,
  children,
  onClick,
  ...rest
}: ElmTabProps) => {
  const ctx = useElmTabsContext();
  return (
    <div
      className={clsx(
        styles["tab"],
        ctx.selectedValue === value && styles["active"],
        className,
      )}
      onClick={(event) => {
        ctx.setSelectedValue(value);
        onClick?.(event);
      }}
      {...rest}
    >
      {children}
    </div>
  );
};

export interface ElmTabPanelProps extends ComponentPropsWithoutRef<"div"> {
  /** Identifier matching the corresponding ElmTab `value`. */
  value: string;
}

export const ElmTabPanel = ({
  value,
  className,
  children,
  ...rest
}: ElmTabPanelProps) => {
  const ctx = useElmTabsContext();
  return (
    <div className={clsx(styles["tab-content"], className)} {...rest}>
      <ElmCollapse
        direction="row"
        isOpen={ctx.selectedValue === value}
        transitionTimingFunction={ctx.transitionTimingFunction}
      >
        <div className={styles["tab-content-inner"]}>{children}</div>
      </ElmCollapse>
    </div>
  );
};
