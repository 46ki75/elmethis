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
import { mdiSend, mdiStop } from "@mdi/js";

export interface ElmAgUiInputProps {
  class?: string;

  style?: CSSProperties;

  isRunning: boolean;

  onInput$: QRL<(event: InputEvent, element: HTMLTextAreaElement) => void>;

  onSubmit$: QRL<(event: Event, element: Element) => void>;
}

export const ElmAgUiInput = component$<ElmAgUiInputProps>(
  ({ class: className, style, isRunning, onInput$, onSubmit$ }) => {
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

        <div
          class={[
            styles["submit-button"],
            {
              [styles["disabled"]]: isRunning,
            },
          ]}
          onClick$={onSubmit}
        >
          <ElmMdiIcon
            d={isRunning ? mdiStop : mdiSend}
            size="1.5rem"
            color="white"
          />
        </div>
      </div>
    );
  },
);
