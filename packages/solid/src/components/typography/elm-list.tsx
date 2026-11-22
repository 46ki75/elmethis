import { dynamic, type JSX } from "@solidjs/web";
import { omit } from "solid-js";
import { clsx } from "clsx";

import styles from "./elm-list.module.css";
import textStyles from "../../styles/text.module.css";

export interface ElmListProps extends Omit<
  JSX.HTMLAttributes<HTMLUListElement | HTMLOListElement>,
  "type"
> {
  listStyle?: "unordered" | "ordered";
  type?: "a" | "i" | "1" | "A" | "I";
}

export const ElmList = (props: ElmListProps) => {
  const rest = omit(props, "class", "children", "listStyle");

  const isOrdered = () => props.listStyle === "ordered";
  const List = dynamic(() => (isOrdered() ? "ol" : "ul"));
  return (
    <List
      {...rest}
      class={clsx(
        textStyles.text,
        styles["elm-list"],
        isOrdered() ? styles.numbered : styles.bulleted,
        props.class,
      )}
    >
      {props.children}
    </List>
  );
};
