/* eslint-disable qwik/jsx-img */

import { component$, useStylesScoped$ } from "@builder.io/qwik";

import styles from "./elm-inline-icon.scoped.scss?inline";

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
  useStylesScoped$(styles);
  return (
    <span class="icon">
      <img src={src} alt={alt} class="icon" />
    </span>
  );
});
