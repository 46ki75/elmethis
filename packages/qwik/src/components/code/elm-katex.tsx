import { component$, useComputed$, useStylesScoped$ } from "@builder.io/qwik";

import textStyle from "../../styles/text.scoped.scss?inline";

import { renderToString } from "katex";

export interface ElmKatexProps {
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

export const ElmKatex = component$<ElmKatexProps>(
  ({ expression, block = false }) => {
    useStylesScoped$(textStyle);
    const html = useComputed$(() =>
      renderToString(expression, {
        displayMode: block,
        output: "mathml",
      }),
    );

    return <div class="text" dangerouslySetInnerHTML={html.value} />;
  },
);
