import React from "react";

import "@styles/global.css";
import styles from "./ElmParagraph.module.css";

export interface ElmParagraphCSSVariables {
  "--elmethis-color"?: React.CSSProperties["color"];
  "--elmethis-background-color"?: React.CSSProperties["backgroundColor"];
}

export interface ElmParagraphProps extends React.PropsWithChildren {
  style?: React.CSSProperties & ElmParagraphCSSVariables;

  color?: React.CSSProperties["color"];

  backgroundColor?: React.CSSProperties["backgroundColor"];
}

export const ElmParagraph = (props: ElmParagraphProps) => {
  return (
    <p
      className={styles["elm-paragraph"]}
      style={{
        "--elmethis-color": props.color,
        "--elmethis-background-color": props.backgroundColor,
        ...props.style,
      }}
    >
      {props.children}
    </p>
  );
};
