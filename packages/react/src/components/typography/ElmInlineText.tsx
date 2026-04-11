import React from "react";
import { clsx } from "clsx";
import { getLuminance } from "polished";

// Styles
import "@styles/global.css";
import styles from "./ElmInlineText.module.css";
import textStyles from "@styles/text.module.css";

export interface ElmInlineTextProps extends React.PropsWithChildren {
  style?: React.CSSProperties & {
    "--elmethis-color"?: React.CSSProperties["color"];
    "--elmethis-background-color"?: React.CSSProperties["backgroundColor"];
    "--elmethis-font-size"?: React.CSSProperties["fontSize"];
  };

  color?: React.CSSProperties["color"];

  backgroundColor?: React.CSSProperties["backgroundColor"];

  size?: React.CSSProperties["fontSize"];

  bold?: boolean;
}

export const ElmInlineText = (props: ElmInlineTextProps) => {
  const render = () => {
    let component = props.children;

    if (props.bold) component = <strong>{component}</strong>;

    return component;
  };

  return (
    <span
      className={clsx(styles["elm-inline-text"], textStyles.text)}
      style={{
        "--elmethis-color":
          props.color ??
          (props.backgroundColor
            ? getLuminance(props.backgroundColor) > 0.5
              ? "#3e434b"
              : "#eeeff1"
            : false),
        "--elmethis-background-color": props.backgroundColor,
        ...props.style,
      }}
    >
      {render()}
    </span>
  );
};
