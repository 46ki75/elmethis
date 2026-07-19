import { splitProps, type JSX } from "solid-js";
import { clsx } from "clsx";
import { mdiImage, mdiTextBox } from "@mdi/js";
import type { UserMessage } from "@ag-ui/client";

import { ElmMdiIcon } from "../../../icon/elm-mdi-icon";
import styles from "./elm-ag-ui-input-content.module.css";

export interface ElmAgUiInputContentImageProps extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "children"
> {
  inputContent: UserMessage["content"];
}

export const ElmAgUiInputContent = (props: ElmAgUiInputContentImageProps) => {
  const [local, rest] = splitProps(props, ["class", "inputContent"]);
  const renderText = (text: string) => (
    <div class={styles["message-content-user-content"]}>{text}</div>
  );

  const renderContent = () => {
    const input = local.inputContent;
    if (typeof input === "string") return renderText(input);

    const media: JSX.Element[] = [];
    const texts: string[] = [];
    for (const content of input) {
      switch (content.type) {
        case "text":
          texts.push(content.text);
          break;
        case "document":
          return (
            <div class={styles["media-component"]}>
              <ElmMdiIcon class={styles["type-icon"]} d={mdiTextBox} />
              <pre class={styles.text}>{content.source.value}</pre>
              <div class={styles["mime-type-label"]}>
                {content.source.mimeType}
              </div>
            </div>
          );
        case "image": {
          const source = content.source;
          const url =
            source.type === "data"
              ? `data:${source.mimeType};base64,${source.value}`
              : source.value;
          media.push(
            <div class={styles["media-component"]}>
              <ElmMdiIcon class={styles["type-icon"]} d={mdiImage} />
              <img
                class={styles.image}
                width={96}
                height={96}
                src={url}
                alt="User attachment"
              />
              <div class={styles["mime-type-label"]}>{source.mimeType}</div>
            </div>,
          );
          break;
        }
        case "audio":
        case "video":
        case "binary":
          return undefined;
      }
    }
    return (
      <>
        <div class={styles["media-component-container"]}>{media}</div>
        {texts.length > 0 && renderText(texts.join("\n"))}
      </>
    );
  };

  return (
    <div {...rest} class={clsx(styles["elm-ag-ui-input-content"], local.class)}>
      {renderContent()}
    </div>
  );
};
