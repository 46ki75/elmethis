import { computed, defineComponent, type HTMLAttributes } from "vue";
import { clsx } from "clsx";

import textStyle from "../../styles/text.module.css";
import styles from "./elm-katex.module.css";

import { renderToString } from "katex";

export interface ElmKatexProps extends HTMLAttributes {
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

export const ElmKatex = defineComponent({
  name: "ElmKatex",
  props: {
    expression: { type: String, required: true },
    block: { type: Boolean, default: false },
  },
  setup(props) {
    const html = computed(() =>
      renderToString(props.expression, {
        displayMode: props.block,
        output: "mathml",
      }),
    );

    // inheritAttrs default: passthrough class/attrs merge onto the root.
    return () => (
      <div
        class={clsx(
          textStyle.text,
          props.block ? styles["elm-katex"] : undefined,
        )}
        innerHTML={html.value}
      />
    );
  },
});
