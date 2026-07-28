import type {
  ComponentPropsWithoutRef,
  CSSProperties,
  MouseEvent,
} from "react";
import { clsx } from "clsx";

import { ElmDotLoadingIcon } from "../icon/elm-dot-loading-icon";
import styles from "./elm-button.module.css";

export interface ElmButtonProps extends ComponentPropsWithoutRef<"button"> {
  /**
   * Whether the button is in loading state.
   */
  isLoading?: boolean;

  /**
   * Whether the button is block.
   */
  block?: boolean;

  color?: string;

  /**
   * Whether the button is primary.
   */
  primary?: boolean;
}

export const ElmButton = ({
  className,
  style,
  onClick,
  isLoading,
  block,
  color,
  primary,
  disabled,
  children,
  ...props
}: ElmButtonProps) => {
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (!isLoading && !disabled) {
      if (onClick) {
        onClick(event);
      }
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={clsx(
        styles["elm-button"],
        !isLoading && !disabled && styles.enable,
        color && styles.colored,
        !color && !primary && styles.normal,
        !color && primary && styles.primary,
        className,
      )}
      style={
        {
          display: block ? "flex" : "inline-flex",
          width: block ? "100%" : "auto",
          cursor: disabled ? "not-allowed" : isLoading ? "progress" : "pointer",
          "--elmethis-scoped-opacity": disabled || isLoading ? 0.6 : undefined,
          "--elmethis-scoped-color": color,
          ...style,
        } as CSSProperties
      }
      {...props}
    >
      {isLoading ? (
        <ElmDotLoadingIcon size="1.5rem" />
      ) : (
        <span className={styles.flex}>{children}</span>
      )}
    </button>
  );
};
