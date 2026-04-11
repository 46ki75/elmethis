import React, { useCallback, useEffect, useRef, useState } from "react";

import "@styles/global.css";
import styles from "./ElmTooltip.module.css";

export interface ElmTooltipCSSVariables {}

export interface ElmTooltipProps {
  style?: React.CSSProperties & ElmTooltipCSSVariables;

  /** The original element that triggers the tooltip. */
  original: React.ReactNode;

  /** The tooltip content displayed on hover. */
  tooltip: React.ReactNode;
}

export const ElmTooltip = (props: ElmTooltipProps) => {
  const elRef = useRef<HTMLSpanElement>(null);
  const [isHover, setIsHover] = useState(false);
  const [position, setPosition] = useState<React.CSSProperties>({});

  const updatePosition = useCallback(() => {
    const el = elRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const windowWidth = window.innerWidth;

    if (rect.x > windowWidth / 2) {
      setPosition({
        top: `${rect.y + rect.height}px`,
        right: `${windowWidth - rect.x - rect.width}px`,
      });
    } else {
      setPosition({
        top: `${rect.y + rect.height}px`,
        left: `${rect.x}px`,
      });
    }
  }, []);

  useEffect(() => {
    if (isHover) {
      updatePosition();
    }
  }, [isHover, updatePosition]);

  return (
    <span
      ref={elRef}
      className={styles.original}
      onMouseOver={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      style={props.style}
    >
      {props.original}

      {isHover && (
        <div
          className={`${styles.tooltip} ${styles["tooltip-enter"]}`}
          style={position}
        >
          {props.tooltip}
        </div>
      )}
    </span>
  );
};
