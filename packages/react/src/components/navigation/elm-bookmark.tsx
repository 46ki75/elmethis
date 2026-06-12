import { useState } from "react";
import type { ComponentPropsWithoutRef, CSSProperties } from "react";
import { clsx } from "clsx";
import { mdiLinkVariant } from "@mdi/js";

import styles from "./elm-bookmark.module.css";
import { ElmInlineText } from "../typography/elm-inline-text";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import { ElmInlineIcon } from "../icon/elm-inline-icon";

export interface ElmBookmarkProps extends ComponentPropsWithoutRef<"div"> {
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

const hiddenStyle: CSSProperties = {
  visibility: "hidden",
  width: "0",
};

export const ElmBookmark = ({
  className,
  title,
  url,
  image,
  description,
  favicon,
  ...props
}: ElmBookmarkProps) => {
  const [isError, setIsError] = useState(false);

  return (
    <div className={clsx(styles["elm-bookmark"], className)} {...props}>
      <a
        className={styles.container}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          className={styles.image}
          src={image}
          alt="OGP Image"
          onError={() => setIsError(true)}
          style={isError || image == null ? hiddenStyle : {}}
        />

        <div className={styles.content}>
          <div className={styles.title}>
            <ElmInlineText bold>{title}</ElmInlineText>
          </div>

          <div className={styles.description}>
            <ElmInlineText size="0.75rem">{description}</ElmInlineText>
          </div>

          <div className={styles.link}>
            {favicon ? (
              <ElmInlineIcon src={favicon} />
            ) : (
              <ElmMdiIcon
                d={mdiLinkVariant}
                color="var(--elmethis-color-accent-info)"
              />
            )}
            <ElmInlineText size="0.75rem">{url}</ElmInlineText>
          </div>
        </div>
      </a>
    </div>
  );
};
