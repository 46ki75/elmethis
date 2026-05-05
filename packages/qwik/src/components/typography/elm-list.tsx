import { component$, CSSProperties, Slot } from "@builder.io/qwik";

import styles from "./elm-list.module.css";

import textStyle from "../../styles/text.module.css";

export interface ElmListProps {
  class?: string;

  listStyle: "unordered" | "ordered";
  style?: CSSProperties;
}

export const ElmList = component$<ElmListProps>(
  ({ class: className, listStyle = "unordered", style }) => {
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
        >
          <Slot />
        </ul>
      );
    }
  },
);
