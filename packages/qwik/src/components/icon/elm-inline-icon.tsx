import { component$, PropsOf } from "@qwik.dev/core";

import styles from "./elm-inline-icon.module.css";

export interface ElmInlineIconProps extends PropsOf<"span"> {
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

export const ElmInlineIcon = component$<ElmInlineIconProps>(
  ({ class: className, src, alt, width, height, size = 16, ...props }) => {
    return (
      <span class={[styles.icon, className]} {...props}>
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
