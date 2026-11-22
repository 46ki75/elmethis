import { onCleanup, omit } from "solid-js";
import type { JSX } from "@solidjs/web";
import { clsx } from "clsx";
import { mdiDownload, mdiFile } from "@mdi/js";

import styles from "./elm-file.module.css";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import { ElmInlineText } from "../typography/elm-inline-text";

export interface ElmFileProps extends JSX.HTMLAttributes<HTMLDivElement> {
  /** The name of the file. */
  name?: string;

  /** The source URL of the file. */
  src: string;

  /** The formatted size of the file. */
  filesize?: string;
}

function getLastPathSegmentWithoutQueryOrHash(
  urlString: string,
): string | null {
  const cleanedUrl = urlString.split(/[?#]/)[0];
  const pathSegments = cleanedUrl.split("/").filter(Boolean);
  return pathSegments.length > 0 ? pathSegments[pathSegments.length - 1] : null;
}

export const ElmFile = (props: ElmFileProps) => {
  const rest = omit(props, "class", "name", "src", "filesize");
  let objectUrl: string | undefined;
  let disposed = false;

  onCleanup(() => {
    disposed = true;
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }
  });

  const downloadFile = async () => {
    const src = props.src;
    const name = props.name;

    try {
      const response = await fetch(src);
      if (!response.ok) {
        throw new Error("Failed to download file");
      }

      const blob = await response.blob();
      if (disposed) {
        return;
      }

      const nextObjectUrl = URL.createObjectURL(blob);
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
      objectUrl = nextObjectUrl;

      const link = document.createElement("a");
      link.href = objectUrl;
      link.download =
        name ?? getLastPathSegmentWithoutQueryOrHash(src) ?? "file";
      link.click();
    } catch (error) {
      console.error("ERROR:", error);
    }
  };

  return (
    <div class={clsx(styles["elm-file"], props.class)} {...rest}>
      <div>
        <ElmMdiIcon path={mdiFile} size="1.25rem" />
      </div>

      <div>
        <ElmInlineText>
          {props.name ?? getLastPathSegmentWithoutQueryOrHash(props.src)}
        </ElmInlineText>
      </div>

      <div class={styles["file-size"]}>
        <ElmInlineText>{props.filesize}</ElmInlineText>
      </div>

      <div class={styles["download-icon"]} onClick={() => void downloadFile()}>
        <ElmMdiIcon path={mdiDownload} size="1.25rem" />
      </div>
    </div>
  );
};
