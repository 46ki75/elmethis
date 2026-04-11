import React, { useEffect, useRef, useState } from "react";

import "@styles/global.css";
import styles from "./ElmDivider.module.css";

export interface ElmDividerCSSVariables {}

export interface ElmDividerProps {
  style?: React.CSSProperties & ElmDividerCSSVariables;

  /**
   * The margin of the divider.
   */
  margin?: React.CSSProperties["marginBlock"];
}

export const ElmDivider = (props: ElmDividerProps) => {
  const targetRef = useRef<HTMLHRElement>(null);
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
    <hr
      ref={targetRef}
      className={styles.divider}
      style={{
        "--scale": isVisible ? 1 : 0,
        "--margin-block": props.margin,
        ...props.style,
      } as React.CSSProperties}
    />
  );
};
