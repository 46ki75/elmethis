import { component$, Slot } from "@builder.io/qwik";

import styles from "./elm-paragraph.module.scss";
import textStyles from "../../styles/text.module.scss";
import { useInView } from "../../hooks/useInView";

export interface ElmParagraphProps {
  color?: string;

  backgroundColor?: string;
}

export const ElmParagraph = component$<ElmParagraphProps>(
  ({ color, backgroundColor }) => {
    const { ref, isVisible } = useInView();

    return (
      <p
        ref={ref}
        class={[styles.paragraph, textStyles.text]}
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
