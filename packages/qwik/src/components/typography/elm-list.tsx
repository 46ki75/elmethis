import { component$, CSSProperties, PropsOf, Slot } from "@builder.io/qwik";

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
            styles["elmethis-list-common"],
            styles["elmethis-numbered-list"],
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
            styles["elmethis-list-common"],
            styles["elmethis-bulleted-list"],
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
