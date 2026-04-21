import { component$, Numberish, type CSSProperties } from "@builder.io/qwik";

import styles from "./elm-inline-icon.module.scss";

export interface ElmInlineIconProps {
  class?: string;

  style?: CSSProperties;

  /**
   * The source URL of the icon.
   */
  src: string;

  /**
   * The alt text for the icon.
   */
  alt?: string;

  width?: Numberish;

  height?: Numberish;

  size?: Numberish;
}

export const ElmInlineIcon = component$<ElmInlineIconProps>(
  ({ class: className, style, src, alt, width, height, size = 16 }) => {
    return (
      <span class={[styles.icon, className]} style={style}>
        <img
          src={src}
          alt={alt}
          class={styles.icon}
          width={width ?? size}
          height={height ?? size}
        />
      </span>
    );
  },
);
