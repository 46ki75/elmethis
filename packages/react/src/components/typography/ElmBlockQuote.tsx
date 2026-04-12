import React, { useRef } from "react";
import { mdiFormatQuoteOpen, mdiFormatQuoteClose } from "@mdi/js";

import "@styles/global.css";
import styles from "./ElmBlockQuote.module.css";
import type { ElmethisCSSVariables } from "@styles/variables";

export type ElmBlockQuoteCSSVariables = Pick<
  ElmethisCSSVariables,
  "--elmethis-margin-block"
>;

export interface ElmBlockQuoteProps extends React.PropsWithChildren {
  style?: React.CSSProperties & ElmBlockQuoteCSSVariables;

  /**
   * The cite URL for the blockquote.
   */
  cite?: string;
}

export const ElmBlockQuote = (props: ElmBlockQuoteProps) => {
  const targetRef = useRef<HTMLQuoteElement>(null);

  return (
    <blockquote
      ref={targetRef}
      className={styles.blockquote}
      cite={props.cite}
      style={{
        ...props.style,
      }}
    >
      {props.children}

      {props.cite && (
        <cite className={styles.cite}>
          <a href={props.cite} target="_blank" rel="noopener noreferrer">
            {props.cite}
          </a>
        </cite>
      )}

      <svg
        className={styles.icon}
        style={{ top: "0.25rem", left: "0.25rem" }}
        viewBox="0 0 24 24"
        width="1rem"
        height="1rem"
      >
        <path d={mdiFormatQuoteOpen} />
      </svg>

      <svg
        className={styles.icon}
        style={{ bottom: "0.25rem", right: "0.25rem" }}
        viewBox="0 0 24 24"
        width="1rem"
        height="1rem"
      >
        <path d={mdiFormatQuoteClose} />
      </svg>
    </blockquote>
  );
};
