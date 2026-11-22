import { type JSX } from "@solidjs/web";
import { omit } from "solid-js";
import { clsx } from "clsx";

import styles from "./elm-table-header.module.css";
import { TableSectionContext } from "./table-context";

export type ElmTableHeaderProps = JSX.HTMLAttributes<HTMLTableSectionElement>;

export const ElmTableHeader = (props: ElmTableHeaderProps) => {
  const rest = omit(props, "class", "children");

  return (
    <TableSectionContext value={() => "head"}>
      <thead {...rest} class={clsx(styles["elm-table-header"], props.class)}>
        {props.children}
      </thead>
    </TableSectionContext>
  );
};
