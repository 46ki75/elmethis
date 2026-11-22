import { type JSX } from "@solidjs/web";
import { createMemo, createSignal, omit, onSettled, Show } from "solid-js";
import { clsx } from "clsx";

import styles from "./elm-table.module.css";
import textStyles from "../../styles/text.module.css";
import { ElmInlineText } from "../typography/elm-inline-text";
import { HasRowHeaderContext } from "./table-context";

export interface ElmTableProps extends JSX.HTMLAttributes<HTMLTableElement> {
  caption?: string;
  hasRowHeader?: boolean;
}

export const ElmTable = (props: ElmTableProps) => {
  const rest = omit(props, "class", "caption", "hasRowHeader", "children");
  const [canScroll, setCanScroll] = createSignal(false);
  const [atStart, setAtStart] = createSignal(true);
  const [atEnd, setAtEnd] = createSignal(true);
  const hasRowHeader = createMemo(() => props.hasRowHeader ?? false);
  let scrollElement: HTMLDivElement | undefined;

  onSettled(() => {
    const element = scrollElement;
    if (element == null) {
      return undefined;
    }

    const measure = () => {
      const max = element.scrollWidth - element.clientWidth;
      setCanScroll(max > 1);
      setAtStart(element.scrollLeft <= 1);
      setAtEnd(element.scrollLeft >= max - 1);
    };

    measure();
    element.addEventListener("scroll", measure, { passive: true });

    const observer =
      typeof ResizeObserver === "undefined"
        ? undefined
        : new ResizeObserver(measure);
    observer?.observe(element);

    return () => {
      element.removeEventListener("scroll", measure);
      observer?.disconnect();
    };
  });

  return (
    <HasRowHeaderContext value={hasRowHeader}>
      <div
        class={styles["elm-table-frame"]}
        data-overflow-start={canScroll() && !atStart() ? "" : undefined}
        data-overflow-end={canScroll() && !atEnd() ? "" : undefined}
      >
        <div
          ref={(element) => {
            scrollElement = element;
          }}
          class={styles["elm-table-scroll"]}
          tabindex={canScroll() ? 0 : undefined}
          role={canScroll() && props.caption != null ? "region" : undefined}
          aria-label={
            canScroll() && props.caption != null ? props.caption : undefined
          }
        >
          <table
            {...rest}
            class={clsx(
              styles["elm-table"],
              textStyles.text,
              props.hasRowHeader && styles["sticky-row-header"],
              props.class,
            )}
          >
            <Show when={props.caption}>
              {(caption) => (
                <caption>
                  <span class={styles.caption}>
                    <span class={styles.spacing} />
                    <span class={styles["caption-inner"]}>
                      <ElmInlineText>{caption()}</ElmInlineText>
                    </span>
                    <span class={styles.spacing} />
                  </span>
                </caption>
              )}
            </Show>
            {props.children}
          </table>
        </div>
      </div>
    </HasRowHeaderContext>
  );
};
