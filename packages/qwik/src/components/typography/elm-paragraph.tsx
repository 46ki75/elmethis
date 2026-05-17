import { type CSSProperties, component$, PropsOf, Slot } from "@qwik.dev/core";

import styles from "./elm-paragraph.module.css";
import textStyles from "../../styles/text.module.css";

export interface ElmParagraphProps extends PropsOf<"p"> {
  color?: string;

  backgroundColor?: string;
}

export const ElmParagraph = component$<ElmParagraphProps>(
  ({ class: className, style, color, backgroundColor, ...props }) => {
    return (
      <p
        class={[styles.paragraph, textStyles.text, className]}
        style={{
          ...(style as CSSProperties),
          "--color": color,
          "--background-color": backgroundColor,
        } as CSSProperties}
        {...props}
      >
        <Slot />
      </p>
    );
  },
);
