import { createEffect, createSignal, on, splitProps, type JSX } from "solid-js";
import { clsx } from "clsx";
import { mdiLinkVariant } from "@mdi/js";

import styles from "./elm-bookmark.module.css";
import { ElmInlineText } from "../typography/elm-inline-text";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import { ElmInlineIcon } from "../icon/elm-inline-icon";

export interface ElmBookmarkProps extends JSX.HTMLAttributes<HTMLDivElement> {
  /** The description of the bookmark. */
  description?: string;

  /** The image URL or base64-encoded image to display. */
  image?: string;

  /** The URL to navigate to. */
  url?: string;

  /** The URL of the favicon. */
  favicon?: string;
}

const HIDDEN_IMAGE_STYLE: JSX.CSSProperties = {
  visibility: "hidden",
  width: "0",
};

export const ElmBookmark = (props: ElmBookmarkProps) => {
  const [local, rest] = splitProps(props, [
    "class",
    "title",
    "url",
    "image",
    "description",
    "favicon",
  ]);
  const [imageError, setImageError] = createSignal(false);

  createEffect(
    on(
      () => local.image,
      () => setImageError(false),
      { defer: true },
    ),
  );

  return (
    <div class={clsx(styles["elm-bookmark"], local.class)} {...rest}>
      <a
        class={styles.container}
        href={local.url}
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          class={styles.image}
          src={local.image}
          alt="OGP Image"
          onError={() => setImageError(true)}
          style={
            imageError() || local.image == null ? HIDDEN_IMAGE_STYLE : undefined
          }
        />

        <div class={styles.content}>
          <div class={styles.title}>
            <ElmInlineText bold>{local.title}</ElmInlineText>
          </div>

          <div class={styles.description}>
            <ElmInlineText size="0.75rem">{local.description}</ElmInlineText>
          </div>

          <div class={styles.link}>
            {local.favicon ? (
              <ElmInlineIcon src={local.favicon} />
            ) : (
              <ElmMdiIcon
                d={mdiLinkVariant}
                color="var(--elmethis-color-accent-info)"
              />
            )}
            <ElmInlineText size="0.75rem">{local.url}</ElmInlineText>
          </div>
        </div>
      </a>
    </div>
  );
};
