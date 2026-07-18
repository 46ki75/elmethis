import { For, splitProps, type JSX } from "solid-js";
import { clsx } from "clsx";
import {
  mdiApplicationOutline,
  mdiChevronRight,
  mdiFolderOpen,
  mdiHome,
} from "@mdi/js";

import styles from "./elm-breadcrumb.module.css";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";

export interface ElmBreadcrumbProps extends JSX.HTMLAttributes<HTMLElement> {
  links: Array<{
    /** The text to display. */
    text: string;

    /** The action to perform when the link is clicked. */
    onClick?: JSX.EventHandler<HTMLSpanElement, MouseEvent>;
  }>;
}

export const ElmBreadcrumb = (props: ElmBreadcrumbProps) => {
  const [local, rest] = splitProps(props, ["class", "links"]);

  return (
    <nav class={clsx(styles["elm-breadcrumb"], local.class)} {...rest}>
      <For each={local.links}>
        {(link, index) => (
          <span style={{ display: "contents" }}>
            <span class={styles["link-container"]} onClick={link.onClick}>
              <ElmMdiIcon
                class={styles.icon}
                d={
                  index() === 0
                    ? mdiHome
                    : index() === local.links.length - 1
                      ? mdiApplicationOutline
                      : mdiFolderOpen
                }
                size="1rem"
              />

              <span class={styles.chunk}>{link.text}</span>
            </span>

            {local.links.length !== index() + 1 && (
              <ElmMdiIcon
                class={styles.chevron}
                d={mdiChevronRight}
                size="1rem"
              />
            )}
          </span>
        )}
      </For>
    </nav>
  );
};
