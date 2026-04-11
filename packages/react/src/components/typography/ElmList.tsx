import React, { useEffect, useRef, useState } from "react";

import "@styles/global.css";
import styles from "./ElmList.module.css";

export interface ElmListCSSVariables {}

export interface ElmListProps extends React.PropsWithChildren {
  style?: React.CSSProperties & ElmListCSSVariables;

  /**
   * The type of list to render.
   * - `unordered` `<ul/>` for a **bulleted** list
   * - `ordered` `<ol/>` for a **numbered** list
   */
  listStyle?: "unordered" | "ordered";
}

export const ElmList = ({
  listStyle = "unordered",
  ...props
}: ElmListProps) => {
  const targetRef = useRef<HTMLOListElement & HTMLUListElement>(null);
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

  const className = [
    styles["elmethis-list-common"],
    listStyle === "unordered"
      ? styles["elmethis-bulleted-list"]
      : styles["elmethis-numbered-list"],
  ].join(" ");

  const inlineStyle = {
    "--opacity": isVisible ? 1 : 0,
    ...props.style,
  } as React.CSSProperties;

  if (listStyle === "ordered") {
    return (
      <ol ref={targetRef} className={className} style={inlineStyle}>
        {props.children}
      </ol>
    );
  }

  return (
    <ul ref={targetRef} className={className} style={inlineStyle}>
      {props.children}
    </ul>
  );
};
