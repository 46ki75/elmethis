import { type JSX } from "@solidjs/web";
import { omit } from "solid-js";

import { TableSectionContext } from "./table-context";

export type ElmTableBodyProps = JSX.HTMLAttributes<HTMLTableSectionElement>;

export const ElmTableBody = (props: ElmTableBodyProps) => {
  const rest = omit(props, "children");

  return (
    <TableSectionContext value={() => "body"}>
      <tbody {...rest}>{props.children}</tbody>
    </TableSectionContext>
  );
};
