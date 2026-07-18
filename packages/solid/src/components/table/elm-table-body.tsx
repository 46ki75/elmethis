import { splitProps, type JSX } from "solid-js";

import { TableSectionContext } from "./table-context";

export type ElmTableBodyProps = JSX.HTMLAttributes<HTMLTableSectionElement>;

export const ElmTableBody = (props: ElmTableBodyProps) => {
  const [local, rest] = splitProps(props, ["children"]);

  return (
    <TableSectionContext.Provider value={() => "body"}>
      <tbody {...rest}>{local.children}</tbody>
    </TableSectionContext.Provider>
  );
};
