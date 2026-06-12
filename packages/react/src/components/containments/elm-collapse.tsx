import type { ComponentPropsWithoutRef, CSSProperties } from "react";
import { clsx } from "clsx";

import styles from "./elm-collapse.module.css";

export interface ElmCollapseProps extends ComponentPropsWithoutRef<"div"> {
  isOpen?: boolean;

  direction?: "row" | "column" | "both";

  transitionTimingFunction?: CSSProperties["transitionTimingFunction"];
}

export const ElmCollapse = ({
  className,
  style,
  isOpen,
  direction = "row",
  transitionTimingFunction = "ease-in-out",
  children,
  ...props
}: ElmCollapseProps) => {
  return (
    <div
      className={clsx(
        styles["elm-collapse"],
        isOpen && styles["open"],
        direction === "row" && styles["row"],
        direction === "column" && styles["column"],
        direction === "both" && styles["both"],
        className,
      )}
      style={
        {
          ...style,
          "--elmethis-scoped-transition-timing-function":
            transitionTimingFunction,
        } as CSSProperties
      }
      {...props}
    >
      <div className={styles["inner"]}>{children}</div>
    </div>
  );
};
