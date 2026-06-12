import type { ComponentPropsWithoutRef } from "react";
import { clsx } from "clsx";

import styles from "./elm-table-row.module.css";

export type ElmTableRowProps = ComponentPropsWithoutRef<"tr">;

export const ElmTableRow = ({
  className,
  children,
  ...props
}: ElmTableRowProps) => {
  return (
    <tr className={clsx(styles["elm-table-row"], className)} {...props}>
      {children}
    </tr>
  );
};
