/* eslint-disable qwik/jsx-img */
import { component$ } from "@builder.io/qwik";

import styles from "./elm-bookmark.module.scss";
import { ElmInlineText } from "../typography/elm-inline-text";
import { mdiLinkVariant } from "@mdi/js";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import { ElmInlineIcon } from "../icon/elm-inline-icon";

export interface ElmBookmarkProps {
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
   * The URL of the favicon.
   */
  favicon?: string;
}

export const ElmBookmark = component$<ElmBookmarkProps>(
  ({ url, image, title, description, favicon }) => {
    return (
      <div class={styles.bookmark}>
        <a
          class={styles.container}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
        >
          <img class={styles.image} src={image} alt="OGP Image" />

          <div class={styles.content}>
            <div class={styles.title}>
              <ElmInlineText bold>{title}</ElmInlineText>
            </div>

            <div class={styles.description}>
              <ElmInlineText size="0.75rem">{description}</ElmInlineText>
            </div>

            <div class={styles.link}>
              {favicon ? (
                <ElmInlineIcon src={favicon} />
              ) : (
                <ElmMdiIcon d={mdiLinkVariant} color="#6987b8" />
              )}
              <ElmInlineText size="0.75rem">{url}</ElmInlineText>
            </div>
          </div>
        </a>
      </div>
    );
  },
);
