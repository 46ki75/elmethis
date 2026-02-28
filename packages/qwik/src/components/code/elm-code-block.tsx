import {
  $,
  component$,
  CSSProperties,
  Slot,
  useSignal,
} from "@builder.io/qwik";

import styles from "./elm-code-block.module.scss";

import { ElmLanguageIcon } from "../icon/elm-language-icon";
import { ElmInlineText } from "../typography/elm-inline-text";
import { ElmShikiHighlighter } from "./elm-shiki-highlighter";

import {
  mdiClipboardMultipleOutline,
  mdiClipboardCheckMultipleOutline,
} from "@mdi/js";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";

export interface ElmCodeBlockProps {
  /**
   * The code to display.
   */
  code: string;

  /**
   * The language of the code.
   */
  language?: string;

  /**
   * The caption of the code block.
   * If not provided, the language will be used.
   */
  caption?: string;

  /**
   * The margin of the code block.
   */
  margin?: CSSProperties["margin"];
}

export const ElmCodeBlock = component$<ElmCodeBlockProps>(
  ({ code, language = "txt", caption, margin }) => {
    const timerId = useSignal<number | null>(null);

    const copyToClipboard = $(async () => {
      if (timerId.value !== null) {
        window.clearTimeout(timerId.value);
        timerId.value = null;
      }

      try {
        await navigator.clipboard.writeText(code);
        timerId.value = window.setTimeout(() => (timerId.value = null), 1500);
      } catch (err) {
        console.error("Failed to copy: ", err);
      }
    });

    return (
      <figure class={styles["code-block"]} style={{ margin }}>
        <span class={styles["language-icon"]}>
          <ElmLanguageIcon language={language} />
        </span>

        <span class={styles["caption"]}>
          <ElmInlineText>
            {caption || language}
            <Slot />
          </ElmInlineText>
        </span>

        <div class={styles["copy-icon"]} onClick$={copyToClipboard}>
          <ElmMdiIcon
            size="1.25rem"
            d={
              timerId.value !== null
                ? mdiClipboardCheckMultipleOutline
                : mdiClipboardMultipleOutline
            }
            color={timerId.value !== null ? "#59b57c" : undefined}
          />
        </div>

        <hr class={styles["divider"]} />

        <div class={styles["code"]}>
          <ElmShikiHighlighter code={code} language={language} />
        </div>
      </figure>
    );
  },
);
