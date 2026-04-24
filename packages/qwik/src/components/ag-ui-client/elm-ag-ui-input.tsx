import { component$, type CSSProperties, type QRL } from "@builder.io/qwik";

import styles from "./elm-ag-ui-input.module.css";
import textStyle from "../../styles/text.module.scss";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import { mdiSend } from "@mdi/js";

export interface ElmAgUiInputProps {
  class?: string;

  style?: CSSProperties;

  onInput$: QRL<(event: InputEvent, element: HTMLInputElement) => void>;

  onSubmit$: QRL<(event: Event, element: HTMLInputElement) => void>;
}

export const ElmAgUiInput = component$<ElmAgUiInputProps>(
  ({ class: className, style, onInput$, onSubmit$ }) => {
    return (
      <div
        class={[styles["elm-ag-ui-input"], textStyle["text"], className]}
        style={style}
      >
        <input type="text" class={styles["input"]} onInput$={onInput$} />

        <div class={styles["submit-button"]} onClick$={onSubmit$}>
          <ElmMdiIcon d={mdiSend} size="1.5rem" color="white" />
        </div>
      </div>
    );
  },
);
