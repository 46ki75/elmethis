import { component$, PropsOf, Slot } from "@qwik.dev/core";

import styles from "./elm-block-quote.module.css";
import textStyles from "../../styles/text.module.css";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import { mdiFormatQuoteClose, mdiFormatQuoteOpen } from "@mdi/js";

export type ElmBlockQuoteProps = PropsOf<"blockquote">;

export const ElmBlockQuote = component$<PropsOf<"blockquote">>(
  ({ class: className, ...props }) => {
    return (
      <blockquote
        class={[styles.blockquote, textStyles.text, className]}
        {...props}
      >
        <div
          class={styles.icon}
          style={{ "--elmethis-scoped-inset": "0.25rem auto auto 0.5rem" }}
        >
          <ElmMdiIcon d={mdiFormatQuoteOpen} />
        </div>

        <div class={styles.body}>
          <Slot />
        </div>

        <div
          class={styles.icon}
          style={{ "--elmethis-scoped-inset": "auto 0.25rem 0.25rem auto" }}
        >
          <ElmMdiIcon d={mdiFormatQuoteClose} />
        </div>
      </blockquote>
    );
  },
);
