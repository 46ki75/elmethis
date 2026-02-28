import { component$, Slot } from "@builder.io/qwik";

import styles from "./elm-paragraph.module.scss";
import textStyles from "../../styles/text.module.scss";

export interface ElmParagraphProps {
  color?: string;

  backgroundColor?: string;
}

export const ElmParagraph = component$<ElmParagraphProps>(
  ({ color, backgroundColor }) => {
    return (
      <p
        class={[styles.paragraph, textStyles.text]}
        style={{ "--color": color, "--background-color": backgroundColor }}
      >
        <Slot />
      </p>
    );
  },
);
