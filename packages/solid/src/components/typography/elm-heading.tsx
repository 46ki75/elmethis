import { dynamic, type JSX } from "@solidjs/web";
import { omit } from "solid-js";
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
  const rest = omit(props, "class", "style", "children", "level", "text", "id");

  const Heading = dynamic(() => `h${props.level}` as const);
  return (
    <Heading
      {...rest}
      class={clsx(
        styles["elm-heading"],
        textStyles.text,
        styles[`h${props.level}`],
        props.class,
      )}
      style={mergeStyle(props.style, {
        "--elmethis-scoped-font-size": `${SIZE_MAP[props.level]}em`,
      })}
      id={props.id}
    >
      <span>{props.text}</span>
      {props.children}
      {props.id && (
        <span style={{ padding: "0.5rem" }}>
          <ElmFragmentIdentifier id={props.id} />
        </span>
      )}

      {props.level === 2 && (
        <span class={styles["h2-underline"]} aria-hidden="true" />
      )}
    </Heading>
  );
};
