import type { ComponentPropsWithoutRef } from "react";

import { TableSectionContext } from "./table-context";

export type ElmTableBodyProps = ComponentPropsWithoutRef<"tbody">;

export const ElmTableBody = ({ children, ...props }: ElmTableBodyProps) => {
  return (
    <TableSectionContext.Provider value="body">
      <tbody {...props}>{children}</tbody>
    </TableSectionContext.Provider>
  );
};
