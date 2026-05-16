/* eslint-disable qwik/jsx-img */
import { $, component$, PropsOf, useSignal } from "@qwik.dev/core";

import styles from "./elm-bookmark.module.css";
import { ElmInlineText } from "../typography/elm-inline-text";
import { mdiLinkVariant } from "@mdi/js";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import { ElmInlineIcon } from "../icon/elm-inline-icon";
import type { CSSProperties } from "@qwik.dev/core";

export interface ElmBookmarkProps extends PropsOf<"div"> {
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
  ({ class: className, title, url, image, description, favicon, ...props }) => {
    const isError = useSignal(false);

    const handleImageOnError = $(() => {
      isError.value = true;
    });

    const hiddenStyle: CSSProperties = {
      visibility: "hidden",
      width: "0",
    };

    return (
      <div class={[styles.bookmark, className]} {...props}>
        <a
          class={styles.container}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            class={styles.image}
            src={image}
            alt="OGP Image"
            onError$={handleImageOnError}
            style={isError.value || image == null ? hiddenStyle : {}}
          />

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
