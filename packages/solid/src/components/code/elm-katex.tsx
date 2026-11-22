import { type JSX } from "@solidjs/web";
import { createMemo, omit } from "solid-js";
import { clsx } from "clsx";
import { renderToString } from "katex";

import textStyles from "../../styles/text.module.css";
import styles from "./elm-katex.module.css";

/* oxlint-disable solid/no-innerhtml -- KaTeX returns escaped MathML with trust disabled. */

export interface ElmKatexProps extends JSX.HTMLAttributes<HTMLDivElement> {
  /** The KaTeX expression. */
  expression: string;

  /** Whether to render the equation in block mode. Defaults to false. */
  block?: boolean;
}

export const ElmKatex = (props: ElmKatexProps) => {
  const rest = omit(props, "class", "expression", "block");
  const html = createMemo(() =>
    renderToString(props.expression, {
      displayMode: props.block ?? false,
      output: "mathml",
    }),
  );

  return (
    <div
      class={clsx(
        textStyles.text,
        props.block && styles["elm-katex"],
        props.class,
      )}
      innerHTML={html()}
      {...rest}
    />
  );
};
