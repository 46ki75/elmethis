import React, { useEffect, useRef, useState } from "react";

import "@styles/global.css";
import styles from "./ElmHeading.module.css";
import { ElmFragmentIdentifier } from "@components/typography/ElmFragmentIdentifier";

const SIZE_MAP: Record<1 | 2 | 3 | 4 | 5 | 6, number> = Object.freeze({
  1: 1.5,
  2: 1.4,
  3: 1.3,
  4: 1.2,
  5: 1.15,
  6: 1.1,
} as const);

export interface ElmHeadingCSSVariables {}

export interface ElmHeadingProps extends React.PropsWithChildren {
  style?: React.CSSProperties & ElmHeadingCSSVariables;

  /**
   * Text to display
   */
  text?: string;

  /**
   * Font size of the text. Default is based on heading level.
   */
  size?: React.CSSProperties["fontSize"];

  /**
   * ID of the heading element.
   * Default is kebab-cased `text`.
   */
  id?: string;

  /**
   * Whether to disable fragment identifier.
   * Default is `false`.
   */
  disableFragmentIdentifier?: boolean;

  /**
   * Heading level (1-6).
   */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

const toKebabCase = (str: string): string => {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
};

export const ElmHeading = ({
  level = 1,
  disableFragmentIdentifier = false,
  ...props
}: ElmHeadingProps) => {
  const targetRef = useRef<HTMLHeadingElement>(null);
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

  const Tag = `h${level}` as const;
  const headingId = props.id ?? (props.text ? toKebabCase(props.text) : undefined);

  const className = [
    styles["heading-common"],
    styles[`h${level}`],
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag
      ref={targetRef}
      className={className}
      id={headingId}
      style={{
        "--font-size": props.size ?? `${SIZE_MAP[level]}rem`,
        "--scale": isVisible ? 1 : 0,
        "--opacity": isVisible ? 1 : 0,
        ...props.style,
      } as React.CSSProperties}
    >
      {props.text && <span>{props.text}</span>}
      {props.children}

      {!disableFragmentIdentifier && headingId && (
        <ElmFragmentIdentifier id={headingId} />
      )}

      {level === 2 && (
        <span className={styles["h2__underline"]} aria-hidden="true"></span>
      )}
    </Tag>
  );
};
