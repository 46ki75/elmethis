import { component$, PropsOf, type QRLEventHandlerMulti } from "@qwik.dev/core";

import styles from "./elm-breadcrumb.module.css";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import {
  mdiApplicationOutline,
  mdiChevronRight,
  mdiFolderOpen,
  mdiHome,
} from "@mdi/js";
import { ElmInlineText } from "../typography/elm-inline-text";

export interface ElmBreadcrumbProps extends PropsOf<"nav"> {
  links: Array<{
    /**
     * The text to display.
     */
    text: string;

    /**
     * The action to perform when the link is clicked.
     */
    onClick$?: QRLEventHandlerMulti<PointerEvent, HTMLElement>;
  }>;
}

export const ElmBreadcrumb = component$<ElmBreadcrumbProps>(
  ({ class: className, links, ...props }) => {
    return (
      <nav class={[styles.container, className]} {...props}>
        {links.map((link, index) => (
          <>
            <span class={styles["link-container"]} onClick$={link.onClick$}>
              <span class={styles.icon}>
                <ElmMdiIcon
                  d={
                    index === 0
                      ? mdiHome
                      : index === links.length - 1
                        ? mdiApplicationOutline
                        : mdiFolderOpen
                  }
                  size="1.25em"
                />
              </span>

              <span class={styles.chunk}>
                <ElmInlineText>{link.text}</ElmInlineText>
              </span>
            </span>

            {links.length !== index + 1 && (
              <span class={styles.chevron}>
                <ElmMdiIcon d={mdiChevronRight} size="1em" />
              </span>
            )}
          </>
        ))}
      </nav>
    );
  },
);
