import { component$, Slot } from "@builder.io/qwik";

import styles from "./elm-heading.module.scss";
import textStyles from "../../styles/text.module.scss";
import { ElmFragmentIdentifier } from "./elm-fragment-identifier";

export interface ElmHeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;

  text?: string;

  id?: string;
}

const SIZE_MAP: Record<1 | 2 | 3 | 4 | 5 | 6, number> = Object.freeze({
  1: 1.5,
  2: 1.4,
  3: 1.3,
  4: 1.2,
  5: 1.15,
  6: 1.1,
} as const);

export const ElmHeading = component$<ElmHeadingProps>(({ level, text, id }) => {
  const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  return (
    <Tag
      class={[styles["heading-common"], textStyles.text, styles[`h${level}`]]}
      style={{ "--font-size": `${SIZE_MAP[level]}em` }}
    >
      {text}
      <Slot />
      {id && (
        <span style={{ padding: "0.5rem" }}>
          <ElmFragmentIdentifier id={id} />
        </span>
      )}
    </Tag>
  );
});
