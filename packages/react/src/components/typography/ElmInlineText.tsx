import React from "react";
import { clsx } from "clsx";

// Styles
import "@styles/global.css";
import styles from "./ElmInlineText.module.css";
import textStyles from "@styles/text.module.css";

export interface ElmInlineTextProps extends React.PropsWithChildren {
  style?: React.CSSProperties & {
    "--elmethis-color"?: string;
  };

  color?: React.CSSProperties["color"];
}

export const ElmInlineText = (props: ElmInlineTextProps) => {
  return (
    <div
      className={clsx(styles["elm-inline-text"], textStyles.text)}
      style={{ "--elmethis-color": props.color, ...props.style }}
    >
      <span></span>
      PLACEHOLDER
      {props.children}
    </div>
  );
};
