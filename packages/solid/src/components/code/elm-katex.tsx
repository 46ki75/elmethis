import { createMemo, splitProps, type JSX } from "solid-js";
import { clsx } from "clsx";
import { renderToString } from "katex";

import textStyles from "../../styles/text.module.css";
import styles from "./elm-katex.module.css";

/* eslint-disable solid/no-innerhtml -- KaTeX returns escaped MathML with trust disabled. */

export interface ElmKatexProps extends JSX.HTMLAttributes<HTMLDivElement> {
  /** The KaTeX expression. */
  expression: string;

  /** Whether to render the equation in block mode. Defaults to false. */
  block?: boolean;
}

export const ElmKatex = (props: ElmKatexProps) => {
  const [local, rest] = splitProps(props, ["class", "expression", "block"]);
  const html = createMemo(() =>
    renderToString(local.expression, {
      displayMode: local.block ?? false,
      output: "mathml",
    }),
  );

  return (
    <div
      class={clsx(
        textStyles.text,
        local.block && styles["elm-katex"],
        local.class,
      )}
      innerHTML={html()}
      {...rest}
    />
  );
};
