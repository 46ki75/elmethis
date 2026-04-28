import { $, component$, type CSSProperties } from "@builder.io/qwik";

import styles from "./elm-fragment-identifier.module.scss";

export interface ElmFragmentIdentifierProps {
  class?: string;

  style?: CSSProperties;

  /**
   * ID of the heading element.
   */
  id: string;
}

export const ElmFragmentIdentifier = component$<ElmFragmentIdentifierProps>(
  ({ class: className, style, id }) => {
    const handleHashClick = $((id: string) => {
      const url = new URL(window.location.href);
      url.hash = id;
      window.history.replaceState(null, "", url.toString());

      const target = document.getElementById(id);
      if (target != null) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    });

    return (
      <span
        class={[styles.fragment, className]}
        style={style}
        onClick$={() => handleHashClick(id)}
      >
        #
      </span>
    );
  },
);
