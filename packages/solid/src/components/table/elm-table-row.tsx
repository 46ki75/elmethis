import { type JSX } from "@solidjs/web";
import { omit } from "solid-js";
import { clsx } from "clsx";

import styles from "./elm-table-row.module.css";

export type ElmTableRowProps = JSX.HTMLAttributes<HTMLTableRowElement>;

export const ElmTableRow = (props: ElmTableRowProps) => {
  const rest = omit(props, "class", "children");

  return (
    <tr {...rest} class={clsx(styles["elm-table-row"], props.class)}>
      {props.children}
    </tr>
  );
};
