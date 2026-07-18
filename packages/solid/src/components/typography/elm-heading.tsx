import { splitProps, type JSX } from "solid-js";
import { Dynamic } from "solid-js/web";
import { clsx } from "clsx";

import styles from "./elm-heading.module.css";
import textStyles from "../../styles/text.module.css";
import { mergeStyle } from "../../styles/merge-style";
import { ElmFragmentIdentifier } from "./elm-fragment-identifier";

export type ElmHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface ElmHeadingProps extends JSX.HTMLAttributes<HTMLHeadingElement> {
  level: ElmHeadingLevel;
  text?: string;
}

const SIZE_MAP: Record<ElmHeadingLevel, number> = Object.freeze({
  1: 1.5,
  2: 1.4,
  3: 1.3,
  4: 1.2,
  5: 1.15,
  6: 1.1,
} as const);

export const ElmHeading = (props: ElmHeadingProps) => {
  const [local, rest] = splitProps(props, [
    "class",
    "style",
    "children",
    "level",
    "text",
    "id",
  ]);

  return (
    <Dynamic
      component={`h${local.level}` as const}
      {...rest}
      class={clsx(
        styles["elm-heading"],
        textStyles.text,
        styles[`h${local.level}`],
        local.class,
      )}
      style={mergeStyle(local.style, {
        "--elmethis-scoped-font-size": `${SIZE_MAP[local.level]}em`,
      })}
      id={local.id}
    >
      <span>{local.text}</span>
      {local.children}
      {local.id && (
        <span style={{ padding: "0.5rem" }}>
          <ElmFragmentIdentifier id={local.id} />
        </span>
      )}

      {local.level === 2 && (
        <span class={styles["h2-underline"]} aria-hidden="true" />
      )}
    </Dynamic>
  );
};
