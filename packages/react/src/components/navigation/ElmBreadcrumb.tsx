import React, { useEffect, useRef, useState } from "react";

import "@styles/global.css";
import styles from "./ElmBreadcrumb.module.css";
import { ElmMdiIcon } from "@components/icon/ElmMdiIcon";
import { ElmInlineText } from "@components/typography/ElmInlineText";

import {
  mdiChevronRight,
  mdiApplicationOutline,
  mdiFolderOpen,
  mdiHome,
} from "@mdi/js";

export interface ElmBreadcrumbCSSVariables {}

export interface ElmBreadcrumbProps {
  style?: React.CSSProperties & ElmBreadcrumbCSSVariables;

  /**
   * The links to display.
   */
  links: Array<{
    /**
     * The text to display.
     */
    text: string;

    /**
     * The action to perform when the link is clicked.
     */
    onClick?: () => void;
  }>;
}

export const ElmBreadcrumb = ({ links, style }: ElmBreadcrumbProps) => {
  const containerRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      className={styles.container}
      ref={containerRef}
      style={
        {
          "--opacity": isVisible ? 1 : 0,
          ...style,
        } as React.CSSProperties
      }
    >
      {links.map((link, index) => (
        <React.Fragment key={index}>
          <div className={styles["link-container"]} onClick={link.onClick}>
            <span
              className={styles.text}
              style={{ "--delay": `${index * 100}ms` } as React.CSSProperties}
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
              className={styles.text}
              style={
                {
                  "--delay": `${index * 100 + 50}ms`,
                } as React.CSSProperties
              }
            >
              <ElmInlineText>{link.text}</ElmInlineText>
            </span>
          </div>

          {links.length !== index + 1 && (
            <span
              className={styles.text}
              style={
                {
                  "--delay": `${index * 100 + 100}ms`,
                } as React.CSSProperties
              }
            >
              <ElmMdiIcon d={mdiChevronRight} size="1em" color="#b69545" />
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
