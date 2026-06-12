import { component$, CSSProperties, PropsOf, Slot } from "@qwik.dev/core";

import styles from "./elm-list.module.css";

import textStyle from "../../styles/text.module.css";

export interface ElmListProps extends Omit<PropsOf<"ul">, "type"> {
  class?: string;

  listStyle: "unordered" | "ordered";
  style?: CSSProperties;
  type?: "a" | "i" | "1" | "A" | "I";
}

export const ElmList = component$<ElmListProps>(
  ({ class: className, listStyle = "unordered", style, ...props }) => {
    if (listStyle === "ordered") {
      return (
        <ol
          class={[
            textStyle.text,
            styles["elm-list"],
            styles.numbered,
            className,
          ]}
          style={style}
          {...props}
        >
          <Slot />
        </ol>
      );
    } else {
      return (
        <ul
          class={[
            textStyle.text,
            styles["elm-list"],
            styles.bulleted,
            className,
          ]}
          style={style}
          {...props}
        >
          <Slot />
        </ul>
      );
    }
  },
);
