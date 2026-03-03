import { component$, Slot } from "@builder.io/qwik";

import styles from "./elm-list.module.scss";

import textStyle from "../../styles/text.module.scss";

export interface ElmListProps {
  listStyle: "unordered" | "ordered";
}

export const ElmList = component$<ElmListProps>(
  ({ listStyle = "unordered" }) => {
    if (listStyle === "ordered") {
      return (
        <ol
          class={[
            textStyle.text,
            styles["elmethis-list-common"],
            styles["elmethis-numbered-list"],
          ]}
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
          ]}
        >
          <Slot />
        </ul>
      );
    }
  },
);
