import { mergeProps, splitProps, type JSX } from "solid-js";
import { Dynamic } from "solid-js/web";
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
  const merged = mergeProps({ listStyle: "unordered" as const }, props);
  const [local, rest] = splitProps(merged, ["class", "children", "listStyle"]);

  return (
    <Dynamic
      component={local.listStyle === "ordered" ? "ol" : "ul"}
      {...rest}
      class={clsx(
        textStyles.text,
        styles["elm-list"],
        local.listStyle === "ordered" ? styles.numbered : styles.bulleted,
        local.class,
      )}
    >
      {local.children}
    </Dynamic>
  );
};
