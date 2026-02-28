import { component$ } from "@builder.io/qwik";

import styles from "./elm-mdi-icon.module.scss";

export interface ElmMdiIconProps {
  d: string;
  size?: string;
  color?: string;
  lightColor?: string;
  darkColor?: string;
}

export const ElmMdiIcon = component$<ElmMdiIconProps>(
  ({ d, size = "1em", color, lightColor, darkColor }) => {
    return (
      <svg
        class={styles.icon}
        style={{
          "--color": lightColor ?? color,
          "--dark-color": darkColor ?? color,
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
