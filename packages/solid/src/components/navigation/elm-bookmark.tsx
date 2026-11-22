import { createEffect, createSignal, omit } from "solid-js";
import type { JSX } from "@solidjs/web";
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
  const rest = omit(
    props,
    "class",
    "title",
    "url",
    "image",
    "description",
    "favicon",
  );
  const [imageError, setImageError] = createSignal(false);

  createEffect(
    () => props.image,
    () => {
      setImageError(false);
    },
    { defer: true },
  );

  return (
    <div class={clsx(styles["elm-bookmark"], props.class)} {...rest}>
      <a
        class={styles.container}
        href={props.url}
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          class={styles.image}
          src={props.image}
          alt="OGP Image"
          onError={() => setImageError(true)}
          style={
            imageError() || props.image == null ? HIDDEN_IMAGE_STYLE : undefined
          }
        />

        <div class={styles.content}>
          <div class={styles.title}>
            <ElmInlineText bold>{props.title}</ElmInlineText>
          </div>

          <div class={styles.description}>
            <ElmInlineText size="0.75rem">{props.description}</ElmInlineText>
          </div>

          <div class={styles.link}>
            {props.favicon ? (
              <ElmInlineIcon src={props.favicon} />
            ) : (
              <ElmMdiIcon
                path={mdiLinkVariant}
                color="var(--elmethis-color-accent-info)"
              />
            )}
            <ElmInlineText size="0.75rem">{props.url}</ElmInlineText>
          </div>
        </div>
      </a>
    </div>
  );
};
