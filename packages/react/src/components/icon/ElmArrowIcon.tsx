import React from "react";

import "@styles/global.css";
import styles from "./ElmArrowIcon.module.css";

export interface ElmArrowIconCSSVariables {}

export interface ElmArrowIconProps {
  style?: React.CSSProperties & ElmArrowIconCSSVariables;

  className?: string;

  /**
   * Specifies the direction of the arrow.
   */
  direction?: "up" | "down" | "left" | "right";

  /**
   * Specifies whether the arrow is in loading state.
   */
  loading?: boolean;

  /**
   * Specifies whether the arrow is in pending state.
   */
  pending?: boolean;

  /**
   * Specifies the size of the arrow.
   */
  size?: React.CSSProperties["height"];
}

export const ElmArrowIcon = (props: ElmArrowIconProps) => {
  const {
    direction = "right",
    loading = false,
    pending = false,
    size = "2rem",
    style,
  } = props;

  const rotation =
    direction === "up"
      ? "rotate(270deg)"
      : direction === "down"
        ? "rotate(90deg)"
        : direction === "left"
          ? "rotate(180deg)"
          : "rotate(0deg)";

  const classNames = [
    styles.arrow,
    !loading && !pending ? styles.normal : undefined,
    loading ? styles.loading : undefined,
    !loading && pending ? styles.pending : undefined,
    props.className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={classNames}
      style={
        {
          "--size": size,
          transform: rotation,
          ...style,
        } as React.CSSProperties
      }
    />
  );
};
