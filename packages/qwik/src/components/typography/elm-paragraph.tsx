import { type CSSProperties, component$, Slot } from "@builder.io/qwik";

import styles from "./elm-paragraph.module.css";
import textStyles from "../../styles/text.module.css";

export interface ElmParagraphProps {
  class?: string;

  style?: CSSProperties;

  color?: string;

  backgroundColor?: string;
}

export const ElmParagraph = component$<ElmParagraphProps>(
  ({ class: className, style, color, backgroundColor }) => {
    return (
      <p
        class={[styles.paragraph, textStyles.text, className]}
        style={{
          ...style,
          "--color": color,
          "--background-color": backgroundColor,
        }}
      >
        <Slot />
      </p>
    );
  },
);
