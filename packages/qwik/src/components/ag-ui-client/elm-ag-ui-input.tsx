import {
  $,
  component$,
  useSignal,
  type CSSProperties,
  type QRL,
} from "@builder.io/qwik";

import styles from "./elm-ag-ui-input.module.css";
import textStyle from "../../styles/text.module.scss";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import { mdiSend } from "@mdi/js";

export interface ElmAgUiInputProps {
  class?: string;

  style?: CSSProperties;

  onInput$: QRL<(event: InputEvent, element: HTMLTextAreaElement) => void>;

  onSubmit$: QRL<(event: Event, element: Element) => void>;
}

export const ElmAgUiInput = component$<ElmAgUiInputProps>(
  ({ class: className, style, onInput$, onSubmit$ }) => {
    const textAreaRef = useSignal<HTMLTextAreaElement>();

    const onSubmit = $((event: Event, element: Element) => {
      onSubmit$(event, element);
      if (textAreaRef.value) {
        textAreaRef.value.value = "";
      }
    });

    return (
      <div
        class={[styles["elm-ag-ui-input"], textStyle["text"], className]}
        style={style}
      >
        <textarea
          ref={textAreaRef}
          class={styles["input"]}
          onInput$={onInput$}
        />

        <div class={styles["submit-button"]} onClick$={onSubmit}>
          <ElmMdiIcon d={mdiSend} size="1.5rem" color="white" />
        </div>
      </div>
    );
  },
);
