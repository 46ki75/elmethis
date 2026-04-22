import { component$, type CSSProperties } from "@builder.io/qwik";

import styles from "./elm-ag-ui-input-content-image.module.css";

import type { ImageInputContent } from "@ag-ui/core";

export interface ElmAgUiInputContentImageProps {
  class?: string;

  style?: CSSProperties;

  imageInputContent: ImageInputContent;
}

export const ElmAgUiInputContentImage =
  component$<ElmAgUiInputContentImageProps>(
    ({ class: className, style, imageInputContent }) => {
      const { source } = imageInputContent;

      const url =
        source.type === "data"
          ? `data:${source.mimeType};base64,${source.value}`
          : source.value;

      return (
        <div
          class={[styles["elm-ag-ui-input-content-image"], className]}
          style={style}
        >
          <img class={styles.image} width={96} height={96} src={url} />
          {source.mimeType && (
            <div class={styles["mime-type-label"]}>{source.mimeType}</div>
          )}
        </div>
      );
    },
  );
