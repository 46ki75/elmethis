import { defineComponent, type HTMLAttributes, type PropType } from "vue";
import { clsx } from "clsx";

import styles from "./elm-breadcrumb.module.css";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import {
  mdiApplicationOutline,
  mdiChevronRight,
  mdiFolderOpen,
  mdiHome,
} from "@mdi/js";

export interface ElmBreadcrumbLink {
  /**
   * The text to display.
   */
  text: string;

  /**
   * The action to perform when the link is clicked.
   */
  onClick?: (event: MouseEvent) => void;
}

export interface ElmBreadcrumbProps extends HTMLAttributes {
  links: ElmBreadcrumbLink[];
}

export const ElmBreadcrumb = defineComponent({
  name: "ElmBreadcrumb",
  props: {
    links: { type: Array as PropType<ElmBreadcrumbLink[]>, required: true },
  },
  setup(props) {
    // inheritAttrs default: passthrough class/style merge onto the root nav.
    return () => (
      <nav class={clsx(styles["elm-breadcrumb"])}>
        {props.links.map((link, index) => (
          <span key={index} style={{ display: "contents" }}>
            <span class={styles["link-container"]} onClick={link.onClick}>
              <ElmMdiIcon
                class={styles.icon}
                d={
                  index === 0
                    ? mdiHome
                    : index === props.links.length - 1
                      ? mdiApplicationOutline
                      : mdiFolderOpen
                }
                size="1rem"
              />

              <span class={styles.chunk}>{link.text}</span>
            </span>

            {props.links.length !== index + 1 && (
              <ElmMdiIcon
                class={styles.chevron}
                d={mdiChevronRight}
                size="1rem"
              />
            )}
          </span>
        ))}
      </nav>
    );
  },
});
