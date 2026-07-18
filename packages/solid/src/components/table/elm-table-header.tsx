import { splitProps, type JSX } from "solid-js";
import { clsx } from "clsx";

import styles from "./elm-table-header.module.css";
import { TableSectionContext } from "./table-context";

export type ElmTableHeaderProps = JSX.HTMLAttributes<HTMLTableSectionElement>;

export const ElmTableHeader = (props: ElmTableHeaderProps) => {
  const [local, rest] = splitProps(props, ["class", "children"]);

  return (
    <TableSectionContext.Provider value={() => "head"}>
      <thead {...rest} class={clsx(styles["elm-table-header"], local.class)}>
        {local.children}
      </thead>
    </TableSectionContext.Provider>
  );
};
