import type { ComponentPropsWithoutRef } from "react";
import { clsx } from "clsx";

import styles from "./elm-mdi-icon.module.css";

export interface ElmMdiIconProps extends Omit<
  ComponentPropsWithoutRef<"svg">,
  "children"
> {
  path: string;
  size?: string | number;
  color?: string;
  label?: string;
}

export const ElmMdiIcon = ({
  className,
  style,
  path,
  size = "1em",
  color,
  label,
  ...props
}: ElmMdiIconProps) => {
  const hasAccessibleName = Boolean(
    label || props["aria-label"] || props["aria-labelledby"],
  );

  return (
    <svg
      className={clsx(styles["elm-mdi-icon"], className)}
      style={style}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      color={color}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      focusable="false"
      aria-hidden={hasAccessibleName ? undefined : "true"}
      role={hasAccessibleName ? "img" : undefined}
      {...props}
    >
      {label && <title>{label}</title>}
      <path d={path} />
    </svg>
  );
};
