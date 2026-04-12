import React, { useCallback } from "react";

import "@styles/global.css";
import styles from "./ElmFile.module.css";
import { ElmMdiIcon } from "@components/icon/ElmMdiIcon";
import { ElmInlineText } from "@components/typography/ElmInlineText";

import { mdiDownload, mdiFileOutline } from "@mdi/js";
import type { ElmethisCSSVariables } from "@styles/variables";

export type ElmFileCSSVariables = Pick<
  ElmethisCSSVariables,
  "--elmethis-margin-block-start"
>;

export interface ElmFileProps {
  style?: React.CSSProperties & ElmFileCSSVariables;

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

export const ElmFile = ({ name, src, filesize, style }: ElmFileProps) => {
  const downloadFile = useCallback(async () => {
    let link: HTMLAnchorElement | undefined;
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
  }, [src, name]);

  const displayName =
    name ?? getLastPathSegmentWithoutQueryOrHash(src) ?? "unknown file";

  return (
    <div className={styles.file} style={style}>
      <div className={styles["left-container"]}>
        <ElmMdiIcon d={mdiFileOutline} size="1.25em" />
        <ElmInlineText>{displayName}</ElmInlineText>
      </div>

      <div className={styles["right-container"]}>
        {filesize && (
          <span style={{ opacity: 0.6 }}>
            <ElmInlineText>{filesize}</ElmInlineText>
          </span>
        )}
        <div className={styles["download-icon"]} onClick={downloadFile}>
          <ElmMdiIcon d={mdiDownload} size="1.25em" />
        </div>
      </div>
    </div>
  );
};
