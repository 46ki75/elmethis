import { $, component$, PropsOf } from "@builder.io/qwik";

import styles from "./elm-fragment-identifier.module.css";

export interface ElmFragmentIdentifierProps extends PropsOf<"span"> {
  /**
   * ID of the heading element.
   */
  id: string;
}

export const ElmFragmentIdentifier = component$<ElmFragmentIdentifierProps>(
  ({ class: className, id, ...props }) => {
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
        onClick$={() => handleHashClick(id)}
        {...props}
      >
        #
      </span>
    );
  },
);
