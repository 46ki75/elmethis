import { component$, type CSSProperties } from "@builder.io/qwik";

import styles from "./elm-ag-ui-user-message.module.css";
import { ElmInlineText } from "../typography/elm-inline-text";

export interface ElmAgUiUserMessageProps {
  class?: string;

  style?: CSSProperties;

  text?: string;
}

export const ElmAgUiUserMessage = component$<ElmAgUiUserMessageProps>(
  ({ class: className, style, text }) => {
    return (
      <div
        class={[styles["message-content-user-wrapper"], className]}
        style={style}
      >
        <div class={styles["message-content-user-inner"]}>
          <div class={styles["message-content-user-content"]}>
            <ElmInlineText>{text}</ElmInlineText>
          </div>
        </div>
      </div>
    );
  },
);
