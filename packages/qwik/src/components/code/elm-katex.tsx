import { component$, useComputed$, type CSSProperties } from "@builder.io/qwik";

import textStyle from "../../styles/text.module.scss";
import styles from "./elm-katex.module.scss";

import { renderToString } from "katex";

export interface ElmKatexProps {
  class?: string;

  style?: CSSProperties;

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
  const { class: className, style } = props;
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
        props.block ? styles.katex : undefined,
        className,
      ]}
      style={style}
      dangerouslySetInnerHTML={html.value ?? ""}
    />
  );
});
