import { computed, defineComponent, provide, type HTMLAttributes } from "vue";
import { clsx } from "clsx";

import styles from "./elm-table.module.css";
import textStyles from "../../styles/text.module.css";
import { ElmInlineText } from "../typography/elm-inline-text";
import { HasRowHeaderContext } from "./table-context";

export interface ElmTableProps extends HTMLAttributes {
  caption?: string;

  hasRowHeader?: boolean;
}

export const ElmTable = defineComponent({
  name: "ElmTable",
  props: {
    caption: { type: String, default: undefined },
    hasRowHeader: { type: Boolean, default: false },
  },
  setup(props, { slots }) {
    provide(
      HasRowHeaderContext,
      computed(() => props.hasRowHeader),
    );

    // `class` (and other native attrs) ride attr fallthrough onto <table>;
    // Vue merges the fallthrough class with the binding below.
    return () => (
      <table class={clsx(styles["elm-table"], textStyles.text)}>
        {props.caption && (
          <caption>
            <span class={styles.caption}>
              <span class={styles.spacing}></span>

              <span class={styles["caption-inner"]}>
                <ElmInlineText>{props.caption}</ElmInlineText>
              </span>

              <span class={styles.spacing}></span>
            </span>
          </caption>
        )}
        {slots.default?.()}
      </table>
    );
  },
});
