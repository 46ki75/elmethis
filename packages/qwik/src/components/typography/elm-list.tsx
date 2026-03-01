import {
  component$,
  Slot,
  useStylesScoped$,
  useStyles$,
} from "@builder.io/qwik";

import listStyles from "./elm-list.global.scss?inline";

import textStyle from "../../styles/text.scoped.scss?inline";

export interface ElmListProps {
  listStyle: "unordered" | "ordered";
}

export const ElmList = component$<ElmListProps>(
  ({ listStyle = "unordered" }) => {
    useStyles$(listStyles);
    useStylesScoped$(textStyle);

    if (listStyle === "ordered") {
      return (
        <ol class={["text", "elmethis-list-common", "elmethis-numbered-list"]}>
          <Slot />
        </ol>
      );
    } else {
      return (
        <ul class={["text", "elmethis-list-common", "elmethis-bulleted-list"]}>
          <Slot />
        </ul>
      );
    }
  },
);
