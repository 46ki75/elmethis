import React, { useEffect, useRef, useState } from "react";
import { mdiFormatQuoteOpen, mdiFormatQuoteClose } from "@mdi/js";

import "@styles/global.css";
import styles from "./ElmBlockQuote.module.css";

export interface ElmBlockQuoteCSSVariables {}

export interface ElmBlockQuoteProps extends React.PropsWithChildren {
  style?: React.CSSProperties & ElmBlockQuoteCSSVariables;

  /**
   * The cite URL for the blockquote.
   */
  cite?: string;
}

export const ElmBlockQuote = (props: ElmBlockQuoteProps) => {
  const targetRef = useRef<HTMLQuoteElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <blockquote
      ref={targetRef}
      className={styles.blockquote}
      cite={props.cite}
      style={{
        "--opacity": isVisible ? 1 : 0,
        ...props.style,
      } as React.CSSProperties}
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
