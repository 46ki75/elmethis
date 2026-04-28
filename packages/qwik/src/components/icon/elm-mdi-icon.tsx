import { component$, type CSSProperties } from "@builder.io/qwik";

import styles from "./elm-mdi-icon.module.scss";

export interface ElmMdiIconProps {
  class?: string;

  style?: CSSProperties;

  d: string;
  size?: string;
  color?: string;
  lightColor?: string;
  darkColor?: string;
}

export const ElmMdiIcon = component$<ElmMdiIconProps>(
  ({
    class: className,
    style,
    d,
    size = "1em",
    color,
    lightColor,
    darkColor,
  }) => {
    return (
      <svg
        class={[styles.icon, className]}
        style={{
          "--color": lightColor ?? color,
          "--dark-color": darkColor ?? color,
          ...style,
        }}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={color}
        xmlns="http://www.w3.org/2000/svg"
        focusable="false"
        role="img"
      >
        <path d={d} />
      </svg>
    );
  },
);
