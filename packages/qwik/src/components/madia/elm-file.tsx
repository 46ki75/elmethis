import { $, component$ } from "@builder.io/qwik";

import styles from "./elm-file.module.scss";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import { mdiDownload, mdiFile } from "@mdi/js";
import { ElmInlineText } from "../typography/elm-inline-text";

export interface ElmFileProps {
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

export const ElmFile = component$<ElmFileProps>(({ name, src, filesize }) => {
  const downloadFile = $(async () => {
    let link;
    try {
      const response = await fetch(src);
      if (!response.ok) throw new Error("Failed to download file");

      const blob = await response.blob();

      link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download =
        name ?? getLastPathSegmentWithoutQueryOrHash(src) ?? "file";
      link.click();
    } catch (error) {
      console.error("ERROR:", error);
    } finally {
      if (link) URL.revokeObjectURL(link.href);
    }
  });

  return (
    <div class={styles.file}>
      <div class={styles["file-icon"]}>
        <ElmMdiIcon d={mdiFile} size="1.25rem" />
      </div>

      <div class={styles["file-name"]}>
        <ElmInlineText>
          {name ?? getLastPathSegmentWithoutQueryOrHash(src)}
        </ElmInlineText>
      </div>

      <div class={styles["file-size"]}>
        <ElmInlineText>{filesize}</ElmInlineText>
      </div>

      <div class={styles["download-icon"]} onClick$={downloadFile}>
        <ElmMdiIcon d={mdiDownload} size="1.25rem" />
      </div>
    </div>
  );
});
