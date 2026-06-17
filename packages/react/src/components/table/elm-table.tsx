import type { ComponentPropsWithoutRef } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { clsx } from "clsx";

import styles from "./elm-table.module.css";
import textStyles from "../../styles/text.module.css";
import { ElmInlineText } from "../typography/elm-inline-text";
import { HasRowHeaderContext } from "./table-context";

export interface ElmTableProps extends ComponentPropsWithoutRef<"table"> {
  caption?: string;

  hasRowHeader?: boolean;
}

/**
 * Tracks horizontal overflow of the scroll container so the table can react to
 * it: expose a keyboard-focusable, labeled scroll region only while it actually
 * overflows, and reveal edge shadows that hint at columns past the viewport.
 *
 * Server render reports "no overflow" (the effect never runs), so the scroll
 * affordances are pure progressive enhancement and never reach the SSR markup.
 */
const useScrollOverflow = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({
    canScroll: false,
    atStart: true,
    atEnd: true,
  });

  useEffect(() => {
    const el = ref.current;
    if (el == null) return;

    const measure = () => {
      const max = el.scrollWidth - el.clientWidth;
      const next = {
        canScroll: max > 1,
        atStart: el.scrollLeft <= 1,
        atEnd: el.scrollLeft >= max - 1,
      };
      setEdges((prev) =>
        prev.canScroll === next.canScroll &&
        prev.atStart === next.atStart &&
        prev.atEnd === next.atEnd
          ? prev
          : next,
      );
    };

    measure();
    el.addEventListener("scroll", measure, { passive: true });
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", measure);
      observer.disconnect();
    };
  }, []);

  return { ref, ...edges };
};

export const ElmTable = ({
  className,
  caption,
  hasRowHeader = false,
  children,
  ...rest
}: ElmTableProps) => {
  const hasRowHeaderValue = useMemo(
    () => ({ value: hasRowHeader }),
    [hasRowHeader],
  );

  const { ref, canScroll, atStart, atEnd } = useScrollOverflow();

  return (
    <HasRowHeaderContext.Provider value={hasRowHeaderValue}>
      <div
        className={styles["elm-table-frame"]}
        data-overflow-start={canScroll && !atStart ? "" : undefined}
        data-overflow-end={canScroll && !atEnd ? "" : undefined}
      >
        <div
          ref={ref}
          className={styles["elm-table-scroll"]}
          tabIndex={canScroll ? 0 : undefined}
          role={canScroll && caption != null ? "region" : undefined}
          aria-label={canScroll && caption != null ? caption : undefined}
        >
          <table
            className={clsx(
              styles["elm-table"],
              textStyles.text,
              hasRowHeader && styles["sticky-row-header"],
              className,
            )}
            {...rest}
          >
            {caption && (
              <caption>
                <span className={styles.caption}>
                  <span className={styles.spacing}></span>

                  <span className={styles["caption-inner"]}>
                    <ElmInlineText>{caption}</ElmInlineText>
                  </span>

                  <span className={styles.spacing}></span>
                </span>
              </caption>
            )}
            {children}
          </table>
        </div>
      </div>
    </HasRowHeaderContext.Provider>
  );
};
