/* eslint-disable qwik/jsx-img */

import { component$ } from "@builder.io/qwik";

import styles from "./elm-inline-icon.module.scss";

export interface ElmInlineIconProps {
  /**
   * The source URL of the icon.
   */
  src: string;

  /**
   * The alt text for the icon.
   */
  alt?: string;
}

export const ElmInlineIcon = component$<ElmInlineIconProps>(({ src, alt }) => {
  return (
    <div class={styles.icon}>
      <img src={src} alt={alt} class={styles.icon} />
    </div>
  );
});
