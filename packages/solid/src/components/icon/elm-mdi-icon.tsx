import { mergeProps, splitProps, type JSX } from "solid-js";
import { clsx } from "clsx";

import styles from "./elm-mdi-icon.module.css";
import { mergeStyle } from "../../styles/merge-style";

const NON_FOCUSABLE = {
  focusable: "false",
} as unknown as JSX.SvgSVGAttributes<SVGSVGElement>;

export interface ElmMdiIconProps extends JSX.SvgSVGAttributes<SVGSVGElement> {
  d: string;
  size?: string;
  color?: string;
  lightColor?: string;
  darkColor?: string;
}

export const ElmMdiIcon = (props: ElmMdiIconProps) => {
  const merged = mergeProps({ size: "1em", color: "currentColor" }, props);
  const [local, rest] = splitProps(merged, [
    "class",
    "style",
    "children",
    "d",
    "size",
    "color",
    "lightColor",
    "darkColor",
  ]);

  return (
    <svg
      class={clsx(styles["elm-mdi-icon"], local.class)}
      style={mergeStyle(local.style, {
        "--elmethis-scoped-color": local.lightColor ?? local.color,
        "--dark-color": local.darkColor ?? local.color,
      })}
      width={local.size}
      height={local.size}
      viewBox="0 0 24 24"
      fill={local.color}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      {...NON_FOCUSABLE}
      {...rest}
    >
      <path d={local.d} />
    </svg>
  );
};
