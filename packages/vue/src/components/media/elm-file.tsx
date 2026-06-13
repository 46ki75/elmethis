import { defineComponent, type HTMLAttributes } from "vue";
import { clsx } from "clsx";
import { mdiDownload, mdiFile } from "@mdi/js";

import styles from "./elm-file.module.css";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import { ElmInlineText } from "../typography/elm-inline-text";

export interface ElmFileProps extends HTMLAttributes {
  /**
   * The name of the file.
   */
  name?: string;

  /**
   * The source of the file.
   */
  src: string;

  /**
   * The size of the file in bytes.
   */
  filesize?: string;
}

function getLastPathSegmentWithoutQueryOrHash(
  urlString: string,
): string | null {
  const cleanedUrl = urlString.split(/[?#]/)[0];
  const pathSegments = cleanedUrl.split("/").filter(Boolean);
  return pathSegments.length > 0 ? pathSegments[pathSegments.length - 1] : null;
}

export const ElmFile = defineComponent({
  name: "ElmFile",
  props: {
    name: { type: String, default: undefined },
    src: { type: String, required: true },
    filesize: { type: String, default: undefined },
  },
  setup(props) {
    const downloadFile = async (): Promise<void> => {
      let link: HTMLAnchorElement | undefined;
      try {
        const response = await fetch(props.src);
        if (!response.ok) throw new Error("Failed to download file");

        const blob = await response.blob();

        link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download =
          props.name ??
          getLastPathSegmentWithoutQueryOrHash(props.src) ??
          "file";
        link.click();
      } catch (error) {
        console.error("ERROR:", error);
      } finally {
        if (link) URL.revokeObjectURL(link.href);
      }
    };

    // inheritAttrs default: passthrough class/style merge onto the root.
    return () => (
      <div class={clsx(styles["elm-file"])}>
        <div>
          <ElmMdiIcon d={mdiFile} size="1.25rem" />
        </div>

        <div>
          <ElmInlineText>
            {props.name ?? getLastPathSegmentWithoutQueryOrHash(props.src)}
          </ElmInlineText>
        </div>

        <div class={styles["file-size"]}>
          <ElmInlineText>{props.filesize}</ElmInlineText>
        </div>

        <div class={styles["download-icon"]} onClick={downloadFile}>
          <ElmMdiIcon d={mdiDownload} size="1.25rem" />
        </div>
      </div>
    );
  },
});
