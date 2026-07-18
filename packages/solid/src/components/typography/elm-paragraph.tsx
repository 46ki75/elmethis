import { splitProps, type JSX } from "solid-js";
import { clsx } from "clsx";

import styles from "./elm-paragraph.module.css";
import textStyles from "../../styles/text.module.css";
import { mergeStyle } from "../../styles/merge-style";

export interface ElmParagraphProps extends JSX.HTMLAttributes<HTMLParagraphElement> {
  color?: string;
  backgroundColor?: string;
}

export const ElmParagraph = (props: ElmParagraphProps) => {
  const [local, rest] = splitProps(props, [
    "class",
    "style",
    "children",
    "color",
    "backgroundColor",
  ]);

  return (
    <p
      {...rest}
      class={clsx(styles["elm-paragraph"], textStyles.text, local.class)}
      style={mergeStyle(local.style, {
        "--elmethis-scoped-color": local.color,
        "--elmethis-scoped-background-color": local.backgroundColor,
      })}
    >
      {local.children}
    </p>
  );
};
