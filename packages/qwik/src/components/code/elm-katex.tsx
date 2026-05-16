import { component$, PropsOf, useComputed$ } from "@qwik.dev/core";

import textStyle from "../../styles/text.module.css";
import styles from "./elm-katex.module.css";

import { renderToString } from "katex";

export interface ElmKatexProps extends PropsOf<"div"> {
  /**
   * The KaTex expression.
   */
  expression: string;

  /**
   * Whether to render the equation in block mode.
   * - If `true`, the equation will be rendered in block mode.
   * - If `false`, the equation will be rendered in inline mode.
   *
   * Default is `false`.
   */
  block?: boolean;
}

export const ElmKatex = component$<ElmKatexProps>((props) => {
  const { class: className, expression: _expression, block, ...rest } = props;
  const html = useComputed$(() =>
    renderToString(props.expression, {
      displayMode: props.block ?? false,
      output: "mathml",
    }),
  );

  return (
    <div
      class={[
        textStyle.text,
        block ? styles.katex : undefined,
        className,
      ]}
      dangerouslySetInnerHTML={html.value ?? ""}
      {...rest}
    />
  );
});
