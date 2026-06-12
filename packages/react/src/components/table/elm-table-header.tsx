import type { ComponentPropsWithoutRef } from "react";
import { clsx } from "clsx";

import styles from "./elm-table-header.module.css";
import { TableSectionContext } from "./table-context";

export type ElmTableHeaderProps = ComponentPropsWithoutRef<"thead">;

export const ElmTableHeader = ({
  className,
  children,
  ...props
}: ElmTableHeaderProps) => {
  return (
    <TableSectionContext.Provider value="head">
      <thead className={clsx(styles["elm-table-header"], className)} {...props}>
        {children}
      </thead>
    </TableSectionContext.Provider>
  );
};
