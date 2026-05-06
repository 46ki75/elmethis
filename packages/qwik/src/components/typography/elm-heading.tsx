import { component$, PropsOf, Slot, type CSSProperties } from "@builder.io/qwik";

import styles from "./elm-heading.module.css";
import textStyles from "../../styles/text.module.css";
import { ElmFragmentIdentifier } from "./elm-fragment-identifier";

export interface ElmHeadingProps extends PropsOf<"h1"> {
  level: 1 | 2 | 3 | 4 | 5 | 6;

  text?: string;
}

const SIZE_MAP: Record<1 | 2 | 3 | 4 | 5 | 6, number> = Object.freeze({
  1: 1.5,
  2: 1.4,
  3: 1.3,
  4: 1.2,
  5: 1.15,
  6: 1.1,
} as const);

export const ElmHeading = component$<ElmHeadingProps>(
  ({ class: className, level, text, id, style, ...props }) => {
    const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
    return (
      <Tag
        class={[
          styles["heading-common"],
          textStyles.text,
          styles[`h${level}`],
          className,
        ]}
        style={{ "--font-size": `${SIZE_MAP[level]}em`, ...(style as CSSProperties) }}
        id={id}
        {...props}
      >
        <span>{text}</span>
        <Slot />
        {id && (
          <span style={{ padding: "0.5rem" }}>
            <ElmFragmentIdentifier id={id} />
          </span>
        )}

        {level === 2 && (
          <span class={styles["h2__underline"]} aria-hidden="true"></span>
        )}
      </Tag>
    );
  },
);
