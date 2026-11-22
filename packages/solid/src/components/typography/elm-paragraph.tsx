import { type JSX } from "@solidjs/web";
import { omit } from "solid-js";
import { clsx } from "clsx";

import styles from "./elm-paragraph.module.css";
import textStyles from "../../styles/text.module.css";
import { mergeStyle } from "../../styles/merge-style";

export interface ElmParagraphProps extends JSX.HTMLAttributes<HTMLParagraphElement> {
  color?: string;
  backgroundColor?: string;
}

export const ElmParagraph = (props: ElmParagraphProps) => {
  const rest = omit(
    props,
    "class",
    "style",
    "children",
    "color",
    "backgroundColor",
  );

  return (
    <p
      {...rest}
      class={clsx(styles["elm-paragraph"], textStyles.text, props.class)}
      style={mergeStyle(props.style, {
        "--elmethis-scoped-color": props.color,
        "--elmethis-scoped-background-color": props.backgroundColor,
      })}
    >
      {props.children}
    </p>
  );
};
