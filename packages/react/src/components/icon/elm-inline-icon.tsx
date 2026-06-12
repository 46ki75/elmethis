import type { ComponentPropsWithoutRef } from "react";
import { clsx } from "clsx";

import styles from "./elm-inline-icon.module.css";

export interface ElmInlineIconProps extends ComponentPropsWithoutRef<"span"> {
  /**
   * The source URL of the icon.
   */
  src: string;

  /**
   * The alt text for the icon.
   */
  alt?: string;

  width?: number | `${number}`;

  height?: number | `${number}`;

  size?: number | `${number}`;
}

export const ElmInlineIcon = ({
  className,
  src,
  alt,
  width,
  height,
  size = 16,
  ...props
}: ElmInlineIconProps) => {
  return (
    <span className={clsx(styles["elm-inline-icon"], className)} {...props}>
      <img
        src={src}
        alt={alt}
        className={styles["elm-inline-icon"]}
        width={width ?? size}
        height={height ?? size}
      />
    </span>
  );
};
