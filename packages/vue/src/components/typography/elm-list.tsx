import { defineComponent, type HTMLAttributes, type PropType } from "vue";
import { clsx } from "clsx";

import styles from "./elm-list.module.css";
import textStyles from "../../styles/text.module.css";

export interface ElmListProps extends Omit<HTMLAttributes, "type"> {
  listStyle?: "unordered" | "ordered";
  type?: "a" | "i" | "1" | "A" | "I";
}

export const ElmList = defineComponent({
  name: "ElmList",
  props: {
    listStyle: {
      type: String as PropType<"unordered" | "ordered">,
      default: "unordered",
    },
  },
  setup(props, { slots }) {
    // `type` and any other native attrs ride attr fallthrough onto the root;
    // Vue merges the fallthrough class with the class binding below.
    return () => {
      if (props.listStyle === "ordered") {
        return (
          <ol
            class={clsx(textStyles.text, styles["elm-list"], styles.numbered)}
          >
            {slots.default?.()}
          </ol>
        );
      }

      return (
        <ul class={clsx(textStyles.text, styles["elm-list"], styles.bulleted)}>
          {slots.default?.()}
        </ul>
      );
    };
  },
});
