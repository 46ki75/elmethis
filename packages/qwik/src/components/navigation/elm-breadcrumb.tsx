import { component$, type QRLEventHandlerMulti } from "@builder.io/qwik";

import styles from "./elm-breadcrumb.module.scss";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import {
  mdiApplicationOutline,
  mdiChevronRight,
  mdiFolderOpen,
  mdiHome,
} from "@mdi/js";
import { ElmInlineText } from "../typography/elm-inline-text";

export interface ElmBreadcrumbProps {
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

export const ElmBreadcrumb = component$<ElmBreadcrumbProps>(({ links }) => {
  return (
    <nav class={styles.container}>
      {links.map((link, index) => (
        <>
          <span class={styles["link-container"]} onClick$={link.onClick$}>
            <span
              class={styles.icon}
              style={{
                "--delay": `${index * 100}ms`,
              }}
            >
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

            <span
              class={styles.text}
              style={{
                "--delay": `${index * 100 + 50}ms`,
              }}
            >
              <ElmInlineText>{link.text}</ElmInlineText>
            </span>
          </span>

          {links.length !== index + 1 && (
            <span
              class={styles.text}
              style={{ "--delay": `${index * 100 + 100}ms` }}
            >
              <ElmMdiIcon d={mdiChevronRight} size="1em" color="#b69545" />
            </span>
          )}
        </>
      ))}
    </nav>
  );
});
