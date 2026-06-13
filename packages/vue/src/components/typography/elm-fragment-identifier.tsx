import { defineComponent, type HTMLAttributes } from "vue";
import { clsx } from "clsx";

import styles from "./elm-fragment-identifier.module.css";

export interface ElmFragmentIdentifierProps extends HTMLAttributes {
  /**
   * ID of the heading element.
   */
  id: string;
}

export const ElmFragmentIdentifier = defineComponent({
  name: "ElmFragmentIdentifier",
  inheritAttrs: false,
  props: {
    id: { type: String, required: true },
  },
  setup(props, { attrs }) {
    // `id` drives the click-to-hash behavior; it is captured in the handler
    // rather than reflected as a DOM attribute (matching qwik/react).
    const handleHashClick = (id: string): void => {
      const url = new URL(window.location.href);
      url.hash = id;
      window.history.replaceState(null, "", url.toString());

      const target = document.getElementById(id);
      if (target != null) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    };

    return () => {
      const { class: className, ...rest } = attrs as Record<string, unknown>;

      return (
        <span
          class={clsx(
            styles["elm-fragment-identifier"],
            className as string | undefined,
          )}
          onClick={() => handleHashClick(props.id)}
          {...rest}
        >
          #
        </span>
      );
    };
  },
});
