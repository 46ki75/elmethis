import { splitProps, type JSX } from "solid-js";
import { clsx } from "clsx";

import styles from "./elm-table-row.module.css";

export type ElmTableRowProps = JSX.HTMLAttributes<HTMLTableRowElement>;

export const ElmTableRow = (props: ElmTableRowProps) => {
  const [local, rest] = splitProps(props, ["class", "children"]);

  return (
    <tr {...rest} class={clsx(styles["elm-table-row"], local.class)}>
      {local.children}
    </tr>
  );
};
