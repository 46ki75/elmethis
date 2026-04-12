import React from "react";

import "@styles/global.css";
import styles from "./ElmList.module.css";
import type { ElmethisCSSVariables } from "@styles/variables";

export type ElmListCSSVariables = Pick<
  ElmethisCSSVariables,
  "--elmethis-margin-block-start"
>;

export interface ElmListProps extends React.PropsWithChildren {
  style?: React.CSSProperties & ElmListCSSVariables;

  /**
   * The type of list to render.
   * - `unordered` `<ul/>` for a **bulleted** list
   * - `ordered` `<ol/>` for a **numbered** list
   */
  listStyle?: "unordered" | "ordered";
}

export const ElmList = ({
  listStyle = "unordered",
  ...props
}: ElmListProps) => {
  const className = [
    styles["elmethis-list-common"],
    listStyle === "unordered"
      ? styles["elmethis-bulleted-list"]
      : styles["elmethis-numbered-list"],
  ].join(" ");

  if (listStyle === "ordered") {
    return (
      <ol className={className} style={props.style}>
        {props.children}
      </ol>
    );
  }

  return (
    <ul className={className} style={props.style}>
      {props.children}
    </ul>
  );
};
