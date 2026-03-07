import { component$, CSSProperties, Slot } from "@builder.io/qwik";

import styles from "./elm-block-quote.module.scss";
import textStyles from "../../styles/text.module.scss";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import { mdiFormatQuoteClose, mdiFormatQuoteOpen } from "@mdi/js";

export interface ElmBlockQuoteProps {
  cite?: string;

  style?: string | CSSProperties;
}

export const ElmBlockQuote = component$<ElmBlockQuoteProps>(
  ({ cite, style }) => {
    return (
      <blockquote
        class={[styles.blockquote, textStyles.text]}
        cite={cite}
        style={style}
      >
        <div
          class={styles.icon}
          style={{ "--inset": "0.25rem auto auto 0.5rem" }}
        >
          <ElmMdiIcon d={mdiFormatQuoteOpen} />
        </div>

        <div class={styles.body}>
          <Slot />
        </div>

        <div
          class={styles.icon}
          style={{ "--inset": "auto 0.25rem 0.25rem auto" }}
        >
          <ElmMdiIcon d={mdiFormatQuoteClose} />
        </div>
      </blockquote>
    );
  },
);
