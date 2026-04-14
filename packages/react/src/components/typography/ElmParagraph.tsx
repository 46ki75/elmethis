import React from "react";

// Styles
import "@styles/global.css";
import styles from "./ElmParagraph.module.css";
import type { ElmethisCSSVariables } from "@styles/variables";

export type ElmParagraphCSSVariables = Pick<
  ElmethisCSSVariables,
  "--elmethis-margin-block-start"
>;

export interface ElmParagraphProps extends React.PropsWithChildren {
  style?: React.CSSProperties & ElmParagraphCSSVariables;

  className?: string;

  backgroundColor?: React.CSSProperties["backgroundColor"];
}

export const ElmParagraph = (props: ElmParagraphProps) => {
  return (
    <p
      className={[styles.paragraph, props.className].filter(Boolean).join(" ")}
      style={{
        backgroundColor: props.backgroundColor,
        ...props.style,
      }}
    >
      {props.children}
    </p>
  );
};
