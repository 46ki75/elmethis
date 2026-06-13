import { defineComponent, type HTMLAttributes } from "vue";
import { clsx } from "clsx";
import { mdiFormatQuoteClose, mdiFormatQuoteOpen } from "@mdi/js";

import styles from "./elm-block-quote.module.css";
import textStyles from "../../styles/text.module.css";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";

export type ElmBlockQuoteProps = HTMLAttributes;

export const ElmBlockQuote = defineComponent({
  name: "ElmBlockQuote",
  setup(_, { slots }) {
    // inheritAttrs default: passthrough class/style merge onto the root.
    return () => (
      <blockquote class={clsx(styles["elm-block-quote"], textStyles.text)}>
        <div class={clsx(styles.icon, styles["icon-top-left"])}>
          <ElmMdiIcon d={mdiFormatQuoteOpen} />
        </div>

        <div class={styles.body}>{slots.default?.()}</div>

        <div class={clsx(styles.icon, styles["icon-bottom-right"])}>
          <ElmMdiIcon d={mdiFormatQuoteClose} />
        </div>
      </blockquote>
    );
  },
});
