import { component$, Slot, useStylesScoped$ } from "@builder.io/qwik";

import styles from "./elm-block-quote.scoped.scss?inline";
import textStyles from "../../styles/text.scoped.scss?inline";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import { mdiFormatQuoteClose, mdiFormatQuoteOpen } from "@mdi/js";

export interface ElmBlockQuoteProps {
  cite?: string;
}

export const ElmBlockQuote = component$<ElmBlockQuoteProps>(({ cite }) => {
  useStylesScoped$(styles);
  useStylesScoped$(textStyles);
  return (
    <blockquote class={["blockquote", "text"]} cite={cite}>
      <div class="icon" style={{ "--inset": "0.25rem auto auto 0.5rem" }}>
        <ElmMdiIcon d={mdiFormatQuoteOpen} />
      </div>

      <div class="body">
        <Slot />
      </div>

      <div class="icon" style={{ "--inset": "auto 0.25rem 0.25rem auto" }}>
        <ElmMdiIcon d={mdiFormatQuoteClose} />
      </div>
    </blockquote>
  );
});
