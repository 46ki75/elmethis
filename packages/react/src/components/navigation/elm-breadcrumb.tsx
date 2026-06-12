import type { ComponentPropsWithoutRef, MouseEvent } from "react";
import { clsx } from "clsx";

import styles from "./elm-breadcrumb.module.css";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import {
  mdiApplicationOutline,
  mdiChevronRight,
  mdiFolderOpen,
  mdiHome,
} from "@mdi/js";

export interface ElmBreadcrumbProps extends ComponentPropsWithoutRef<"nav"> {
  links: Array<{
    /**
     * The text to display.
     */
    text: string;

    /**
     * The action to perform when the link is clicked.
     */
    onClick?: (event: MouseEvent<HTMLSpanElement>) => void;
  }>;
}

export const ElmBreadcrumb = ({
  className,
  links,
  ...props
}: ElmBreadcrumbProps) => {
  return (
    <nav className={clsx(styles["elm-breadcrumb"], className)} {...props}>
      {links.map((link, index) => (
        <span key={index} style={{ display: "contents" }}>
          <span className={styles["link-container"]} onClick={link.onClick}>
            <ElmMdiIcon
              className={styles.icon}
              d={
                index === 0
                  ? mdiHome
                  : index === links.length - 1
                    ? mdiApplicationOutline
                    : mdiFolderOpen
              }
              size="1rem"
            />

            <span className={styles.chunk}>{link.text}</span>
          </span>

          {links.length !== index + 1 && (
            <ElmMdiIcon
              className={styles.chevron}
              d={mdiChevronRight}
              size="1rem"
            />
          )}
        </span>
      ))}
    </nav>
  );
};
