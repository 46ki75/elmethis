import { type ComponentProps, type CSSProperties } from "react";
import style from "./ElmMdiIcon.module.scss";

export interface ElmMdiIconProps extends ComponentProps<"svg"> {
  size?: string;
  d: string;
  color?: string;
  lightColor?: string;
  darkColor?: string;
}

export const ElmMdiIcon = ({
  size = "1rem",
  d,
  color,
  lightColor,
  darkColor,
}: ElmMdiIconProps) => {
  return (
    <svg
      className={style.icon}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      focusable="false"
      role="img"
      style={
        {
          "--color": lightColor ?? color,
          "--dark-color": darkColor ?? color,
        } as CSSProperties
      }
    >
      <path d={d} />
    </svg>
  );
};
