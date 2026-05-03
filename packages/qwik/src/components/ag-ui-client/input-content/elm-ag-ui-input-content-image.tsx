import { component$, type CSSProperties } from "@builder.io/qwik";

import styles from "./elm-ag-ui-input-content-image.module.css";

import { ElmMdiIcon } from "../../icon/elm-mdi-icon";
import { mdiImage } from "@mdi/js";
import { InputContent } from "@ag-ui/client";

export interface ElmAgUiInputContentImageProps {
  class?: string;

  style?: CSSProperties;

  inputContent: InputContent;
}

export const ElmAgUiInputContentImage =
  component$<ElmAgUiInputContentImageProps>(
    ({ class: className, style, inputContent }) => {
      switch (inputContent.type) {
        case "text": {
          return <></>;
        }
        case "audio": {
          return <></>;
        }
        case "video": {
          return <></>;
        }
        case "document": {
          return <></>;
        }
        case "binary": {
          return <></>;
        }

        case "image": {
          const { source } = inputContent;

          const url =
            source.type === "data"
              ? `data:${source.mimeType};base64,${source.value}`
              : source.value;

          return (
            <div
              class={[styles["elm-ag-ui-input-content-image"], className]}
              style={style}
            >
              <ElmMdiIcon class={styles["image-icon"]} d={mdiImage} />
              <img class={styles.image} width={96} height={96} src={url} />
              {source.mimeType && (
                <div class={styles["mime-type-label"]}>{source.mimeType}</div>
              )}
            </div>
          );
        }
      }
    },
  );
