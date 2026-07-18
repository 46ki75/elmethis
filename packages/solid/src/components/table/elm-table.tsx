import {
  createMemo,
  createSignal,
  onCleanup,
  onMount,
  Show,
  splitProps,
  type JSX,
} from "solid-js";
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
  const [local, rest] = splitProps(props, [
    "class",
    "caption",
    "hasRowHeader",
    "children",
  ]);
  const [canScroll, setCanScroll] = createSignal(false);
  const [atStart, setAtStart] = createSignal(true);
  const [atEnd, setAtEnd] = createSignal(true);
  const hasRowHeader = createMemo(() => local.hasRowHeader ?? false);
  let scrollElement: HTMLDivElement | undefined;

  onMount(() => {
    const element = scrollElement;
    if (element == null) return;

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

    onCleanup(() => {
      element.removeEventListener("scroll", measure);
      observer?.disconnect();
    });
  });

  return (
    <HasRowHeaderContext.Provider value={hasRowHeader}>
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
          tabIndex={canScroll() ? 0 : undefined}
          role={canScroll() && local.caption != null ? "region" : undefined}
          aria-label={
            canScroll() && local.caption != null ? local.caption : undefined
          }
        >
          <table
            {...rest}
            class={clsx(
              styles["elm-table"],
              textStyles.text,
              local.hasRowHeader && styles["sticky-row-header"],
              local.class,
            )}
          >
            <Show when={local.caption}>
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
            {local.children}
          </table>
        </div>
      </div>
    </HasRowHeaderContext.Provider>
  );
};
