import React, { useCallback, useEffect, useRef, useState } from "react";

import "@styles/global.css";
import styles from "./ElmButton.module.css";

import { ElmDotLoadingIcon } from "@components/icon/ElmDotLoadingIcon";

export interface ElmButtonCSSVariables {
  "--opacity"?: number;
  "--color"?: string;
}

export interface ElmButtonProps extends React.PropsWithChildren {
  style?: React.CSSProperties & ElmButtonCSSVariables;

  /** Whether the button is in loading state. */
  loading?: boolean;

  /** Whether the button is block. */
  block?: boolean;

  /** Whether the button is disabled. */
  disabled?: boolean;

  /** Custom color for the button. */
  color?: string;

  /** Whether the button is primary. */
  primary?: boolean;

  /** Click handler. */
  onClick?: () => void;
}

export const ElmButton = ({
  loading = false,
  block = false,
  disabled = false,
  primary = false,
  ...props
}: ElmButtonProps) => {
  const [clicked, setClicked] = useState(false);
  const timeoutRef = useRef<number | undefined>(undefined);

  const { onClick } = props;

  const handleClick = useCallback(() => {
    if (!loading && !disabled && onClick) {
      setClicked(true);
      timeoutRef.current = window.setTimeout(() => setClicked(false), 300);
      onClick();
    }
  }, [loading, disabled, onClick]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const classNames = [
    styles.button,
    !loading && !disabled ? styles.enable : "",
    props.color ? styles.colored : "",
    !props.color && !primary ? styles.normal : "",
    !props.color && primary ? styles.primary : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      className={classNames}
      style={{
        display: block ? "flex" : "inline-flex",
        width: block ? "100%" : "auto",
        cursor: disabled ? "not-allowed" : loading ? "progress" : "pointer",
        "--opacity": disabled || loading ? 0.6 : undefined,
        "--color": props.color,
        ...props.style,
      } as React.CSSProperties}
      onClick={handleClick}
    >
      {clicked && <div className={styles.ripple}></div>}

      {loading ? (
        <ElmDotLoadingIcon size="1.5rem" />
      ) : (
        <span className={styles.flex}>{props.children}</span>
      )}

      <div className={styles["button-ornament"]}></div>
    </button>
  );
};
