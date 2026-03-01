import { component$, Slot, useStylesScoped$ } from "@builder.io/qwik";

import styles from "./elm-paragraph.scoped.scss?inline";
import textStyles from "../../styles/text.scoped.scss?inline";
import { useInView } from "../../hooks/useInView";

export interface ElmParagraphProps {
  color?: string;

  backgroundColor?: string;
}

export const ElmParagraph = component$<ElmParagraphProps>(
  ({ color, backgroundColor }) => {
    useStylesScoped$(styles);
    useStylesScoped$(textStyles);

    const { ref, isVisible } = useInView();

    return (
      <p
        ref={ref}
        class={["paragraph", "text"]}
        style={{
          "--color": color,
          "--background-color": backgroundColor,
          "--opacity": isVisible.value ? 1 : 0,
        }}
      >
        <Slot />
      </p>
    );
  },
);
