import React, { useState } from "react";

import "@styles/global.css";
import styles from "./ElmBookmark.module.css";
import { ElmInlineText } from "@components/typography/ElmInlineText";
import { ElmMdiIcon } from "@components/icon/ElmMdiIcon";
import { ElmInlineIcon } from "@components/icon/ElmInlineIcon";

import { mdiCalendarMonth, mdiCalendarRefresh } from "@mdi/js";
import type { ElmethisCSSVariables } from "@styles/variables";

export type ElmBookmarkCSSVariables = Pick<
  ElmethisCSSVariables,
  "--elmethis-margin-block-start"
>;

export interface ElmBookmarkProps {
  style?: React.CSSProperties & ElmBookmarkCSSVariables;

  /**
   * Whether to hide the URL.
   */
  hideUrl?: boolean;

  /**
   * Whether to open the link in a new tab.
   * Defaults to `true`.
   */
  openInNewTab?: boolean;

  /**
   * The title of the bookmark.
   */
  title?: string;

  /**
   * The description of the bookmark.
   */
  description?: string;

  /**
   * The image to display.
   * This can be a URL or a base64-encoded image.
   */
  image?: string;

  /**
   * The URL to navigate to.
   */
  url?: string;

  /**
   * The date the bookmark was created.
   */
  createdAt?: string;

  /**
   * The date the bookmark was last updated.
   */
  updatedAt?: string;

  /**
   * The function to call when the link is clicked.
   * If provided, the default behavior (navigating to the URL) is prevented.
   */
  onClick?: () => void;

  /**
   * The URL of the favicon.
   */
  favicon?: string;
}

export const ElmBookmark = ({
  hideUrl = false,
  openInNewTab = true,
  title,
  description = "No description provided",
  image,
  url,
  createdAt,
  updatedAt,
  onClick,
  favicon,
  style,
}: ElmBookmarkProps) => {
  const [imageError, setImageError] = useState(false);

  const handleClick = (event: React.MouseEvent) => {
    if (onClick) {
      event.preventDefault();
      onClick();
    }
  };

  const truncatedDescription =
    description != null && description.length > 100
      ? description.slice(0, 100) + "..."
      : description;

  return (
    <div className={styles.parent} style={style}>
      <a
        className={styles.bookmark}
        href={url}
        target={openInNewTab ? "_blank" : undefined}
        rel="noopener noreferrer"
        onClick={handleClick}
      >
        {image != null && !imageError && (
          <div className={styles.image}>
            <img
              src={image}
              alt="OGP Image"
              onError={() => setImageError(true)}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
        )}

        <div className={styles.typography}>
          <div className={styles.title}>
            <ElmInlineText bold>{title ?? "No title provided"}</ElmInlineText>
          </div>

          <div>
            <ElmInlineText size="0.8rem">
              <span style={{ opacity: 0.6 }}>{truncatedDescription}</span>
            </ElmInlineText>
          </div>

          {(createdAt != null || updatedAt != null) && (
            <div className={styles.date}>
              {createdAt != null && (
                <>
                  <ElmMdiIcon d={mdiCalendarMonth} size="1em" />
                  <ElmInlineText size="0.8rem">{createdAt}</ElmInlineText>
                </>
              )}
              {updatedAt != null && (
                <>
                  <ElmMdiIcon d={mdiCalendarRefresh} size="1em" />
                  <ElmInlineText size="0.8rem">{updatedAt}</ElmInlineText>
                </>
              )}
            </div>
          )}

          {!hideUrl && url != null && (
            <div className={styles.link}>
              {favicon && <ElmInlineIcon src={favicon} />}
              <ElmInlineText size="0.8rem" color="#6987b8">
                {url}
              </ElmInlineText>
            </div>
          )}
        </div>
      </a>
    </div>
  );
};
