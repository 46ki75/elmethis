import { component$, Slot } from "@builder.io/qwik";

import styles from "./elm-heading.module.scss";
import textStyles from "../../styles/text.module.scss";

export interface ElmHeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;

  text?: string;
}

export const ElmHeading = component$<ElmHeadingProps>(({ level, text }) => {
  const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  return (
    <Tag class={[styles.heading, textStyles.text]}>
      {text}
      <Slot />
    </Tag>
  );
});
