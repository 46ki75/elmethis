import { type ComponentProps } from "react";
import { clsx } from "clsx";

import style from "./ElmBlockQuote.module.scss";
import textStyle from "../../styles/text.module.scss";

export interface ElmBlockQuoteProps extends ComponentProps<"blockquote"> {
  cite?: string;
  source?: string;
}

export const ElmBlockQuote = (props: ElmBlockQuoteProps) => {
  return (
    <blockquote
      className={clsx([style.blockquote, textStyle.text])}
      cite={props.cite}
    >
      {props.children}
      {props.source != null &&
        (props.cite ? (
          <a href={props.cite} target="_blank" rel="noopener noreferrer">
            <cite>-&nbsp;{props.source}</cite>
          </a>
        ) : (
          <cite>-&nbsp;{props.source}</cite>
        ))}
    </blockquote>
  );
};
