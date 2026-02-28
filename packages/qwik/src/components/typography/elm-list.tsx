import { component$, Slot } from "@builder.io/qwik";

import "./elm-list.global.scss";

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
            "elmethis-list-common",
            "elmethis-numbered-list",
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
            "elmethis-list-common",
            "elmethis-bulleted-list",
          ]}
        >
          <Slot />
        </ul>
      );
    }
  },
);
