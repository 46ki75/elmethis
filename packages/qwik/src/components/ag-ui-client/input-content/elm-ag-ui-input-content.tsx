import { component$, type CSSProperties } from "@builder.io/qwik";

import styles from "./elm-ag-ui-input-content.module.css";

import { ElmMdiIcon } from "../../icon/elm-mdi-icon";
import { mdiImage, mdiTextBox } from "@mdi/js";
import { UserMessage } from "@ag-ui/client";

export interface ElmAgUiInputContentImageProps {
  class?: string;

  style?: CSSProperties;

  inputContent: UserMessage["content"];
}

export const ElmAgUiInputContent = component$<ElmAgUiInputContentImageProps>(
  ({ class: className, style, inputContent }) => {
    const renderTextContent = (text: string) => {
      return <div class={styles["message-content-user-content"]}>{text}</div>;
    };

    if (typeof inputContent === "string") {
      return renderTextContent(inputContent);
    } else {
      const components = [];

      for (const content of inputContent) {
        switch (content.type) {
          case "text": {
            components.push(
              <>
                <div
                  class={[styles["elm-ag-ui-input-content"], className]}
                  style={style}
                >
                  <ElmMdiIcon class={styles["type-icon"]} d={mdiTextBox} />
                  <div>
                    <pre class={styles.text}>{content.text}</pre>
                  </div>
                  <div class={styles["mime-type-label"]}>Text</div>
                </div>
              </>,
            );
            break;
          }
          case "audio": {
            return <></>;
          }
          case "video": {
            return <></>;
          }
          case "document": {
            return (
              <>
                <div
                  class={[styles["elm-ag-ui-input-content"], className]}
                  style={style}
                >
                  <ElmMdiIcon class={styles["type-icon"]} d={mdiTextBox} />
                  <div>
                    <pre class={styles.text}>{content.source.value}</pre>
                  </div>
                  <div class={styles["mime-type-label"]}>Text</div>
                </div>
              </>
            );
          }
          case "binary": {
            return <></>;
          }

          case "image": {
            const { source } = content;

            const url =
              source.type === "data"
                ? `data:${source.mimeType};base64,${source.value}`
                : source.value;

            components.push(
              <div
                class={[styles["elm-ag-ui-input-content"], className]}
                style={style}
              >
                <ElmMdiIcon class={styles["type-icon"]} d={mdiImage} />
                <img class={styles.image} width={96} height={96} src={url} />
                {source.mimeType && (
                  <div class={styles["mime-type-label"]}>{source.mimeType}</div>
                )}
              </div>,
            );

            break;
          }
        }
      }

      return <div>{components}</div>;
    }
  },
);
