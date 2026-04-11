import React from "react";

// Styles
import "@styles/global.css";
import styles from "./ElmParagraph.module.css";
import type { ElmethisCSSVariables } from "@styles/variables";

export type ElmParagraphCSSVariables = Pick<
  ElmethisCSSVariables,
  "--elmethis-margin-block"
>;

export interface ElmParagraphProps extends React.PropsWithChildren {
  style?: React.CSSProperties & ElmParagraphCSSVariables;

  backgroundColor?: React.CSSProperties["backgroundColor"];
}

export const ElmParagraph = (props: ElmParagraphProps) => {
  return (
    <p
      className={styles.paragraph}
      style={{
        backgroundColor: props.backgroundColor,
        ...props.style,
      }}
    >
      {props.children}
    </p>
  );
};
