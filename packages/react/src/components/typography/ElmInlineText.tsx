import React from "react";
import { clsx } from "clsx";

// Styles
import "@styles/global.css";
import styles from "./ElmInlineText.module.css";
import textStyles from "@styles/text.module.css";

export interface ElmInlineTextProps extends React.PropsWithChildren {
  style?: React.CSSProperties & {
    "--elmethis-color"?: string;
    "--elmethis-background-color"?: string;
  };

  color?: React.CSSProperties["color"];

  backgroundColor?: React.CSSProperties["backgroundColor"];
}

export const ElmInlineText = (props: ElmInlineTextProps) => {
  return (
    <span
      className={clsx(styles["elm-inline-text"], textStyles.text)}
      style={{
        "--elmethis-color": props.color,
        "--elmethis-background-color": props.backgroundColor,
        ...props.style,
      }}
    >
      {props.children}
    </span>
  );
};
