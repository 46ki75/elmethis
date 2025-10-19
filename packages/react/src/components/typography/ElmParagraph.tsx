import type { ComponentProps } from "react";
import textStyle from "../../styles/text.module.scss";

export type ElmParagraphProps = ComponentProps<"p">;

export const ElmParagraph = (props: ElmParagraphProps) => {
  return <p className={textStyle.text}>{props.children}</p>;
};
