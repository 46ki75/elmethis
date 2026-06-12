import type { ComponentPropsWithoutRef, CSSProperties } from "react";
import { clsx } from "clsx";

import styles from "./elm-mdi-icon.module.css";

export interface ElmMdiIconProps extends ComponentPropsWithoutRef<"svg"> {
  d: string;
  size?: string;
  color?: string;
  lightColor?: string;
  darkColor?: string;
}

export const ElmMdiIcon = ({
  className,
  style,
  d,
  size = "1em",
  color = "currentColor",
  lightColor,
  darkColor,
  ...props
}: ElmMdiIconProps) => {
  return (
    <svg
      className={clsx(styles["elm-mdi-icon"], className)}
      style={
        {
          "--elmethis-scoped-color": lightColor ?? color,
          "--dark-color": darkColor ?? color,
          ...style,
        } as CSSProperties
      }
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      focusable="false"
      role="img"
      {...props}
    >
      <path d={d} />
    </svg>
  );
};
