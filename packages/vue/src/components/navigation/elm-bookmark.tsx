import {
  defineComponent,
  ref,
  type CSSProperties,
  type HTMLAttributes,
} from "vue";
import { clsx } from "clsx";
import { mdiLinkVariant } from "@mdi/js";

import styles from "./elm-bookmark.module.css";
import { ElmInlineText } from "../typography/elm-inline-text";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import { ElmInlineIcon } from "../icon/elm-inline-icon";

export interface ElmBookmarkProps extends HTMLAttributes {
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

const hiddenStyle: CSSProperties = {
  visibility: "hidden",
  width: "0",
};

export const ElmBookmark = defineComponent({
  name: "ElmBookmark",
  props: {
    // `title` is rendered as content, so it is declared (kept out of attrs)
    // rather than passed through as the native attribute.
    title: { type: String, default: undefined },
    description: { type: String, default: undefined },
    image: { type: String, default: undefined },
    url: { type: String, default: undefined },
    favicon: { type: String, default: undefined },
  },
  setup(props) {
    const isError = ref(false);

    // inheritAttrs default: passthrough class/style merge onto the root.
    return () => (
      <div class={clsx(styles["elm-bookmark"])}>
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
            onError={() => (isError.value = true)}
            style={isError.value || props.image == null ? hiddenStyle : {}}
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
                  d={mdiLinkVariant}
                  color="var(--elmethis-color-accent-info)"
                />
              )}
              <ElmInlineText size="0.75rem">{props.url}</ElmInlineText>
            </div>
          </div>
        </a>
      </div>
    );
  },
});
