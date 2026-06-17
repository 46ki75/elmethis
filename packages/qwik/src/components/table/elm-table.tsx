import {
  component$,
  PropsOf,
  Slot,
  useContextProvider,
  useSignal,
  useTask$,
  useVisibleTask$,
} from "@qwik.dev/core";
import styles from "./elm-table.module.css";
import textStyles from "../../styles/text.module.css";
import { ElmInlineText } from "../typography/elm-inline-text";
import { HasRowHeaderContext } from "./table-context";

export interface ElmTableProps extends PropsOf<"table"> {
  caption?: string;

  hasRowHeader?: boolean;
}

export const ElmTable = component$<ElmTableProps>((props) => {
  const {
    class: className,
    caption,
    hasRowHeader: _hasRowHeader,
    ...rest
  } = props;

  const hasRowHeader = useSignal(props.hasRowHeader ?? false);
  useTask$(({ track }) => {
    hasRowHeader.value = track(() => props.hasRowHeader) ?? false;
  });
  useContextProvider(HasRowHeaderContext, hasRowHeader);

  // Horizontal-overflow state, mirrored from the scroll container so the table
  // can expose a keyboard-focusable, labeled scroll region only while it
  // overflows and reveal edge shadows that hint at columns past the viewport.
  // Stays false during SSR, so the scroll affordances are pure progressive
  // enhancement and never reach the server markup.
  const scrollRef = useSignal<HTMLDivElement>();
  const canScroll = useSignal(false);
  const atStart = useSignal(true);
  const atEnd = useSignal(true);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(
    ({ cleanup }) => {
      const el = scrollRef.value;
      if (el == null) return;

      const measure = () => {
        const max = el.scrollWidth - el.clientWidth;
        canScroll.value = max > 1;
        atStart.value = el.scrollLeft <= 1;
        atEnd.value = el.scrollLeft >= max - 1;
      };

      measure();
      el.addEventListener("scroll", measure, { passive: true });
      cleanup(() => el.removeEventListener("scroll", measure));

      // Guarded for the createDOM/happy-dom test env, which lacks ResizeObserver.
      if (typeof ResizeObserver !== "undefined") {
        const observer = new ResizeObserver(measure);
        observer.observe(el);
        cleanup(() => observer.disconnect());
      }
    },
    { strategy: "document-ready" },
  );

  return (
    <div
      class={styles["elm-table-frame"]}
      data-overflow-start={canScroll.value && !atStart.value ? "" : undefined}
      data-overflow-end={canScroll.value && !atEnd.value ? "" : undefined}
    >
      <div
        ref={scrollRef}
        class={styles["elm-table-scroll"]}
        tabIndex={canScroll.value ? 0 : undefined}
        role={canScroll.value && caption != null ? "region" : undefined}
        aria-label={canScroll.value && caption != null ? caption : undefined}
      >
        <table
          class={[
            styles["elm-table"],
            textStyles.text,
            hasRowHeader.value && styles["sticky-row-header"],
            className,
          ]}
          {...rest}
        >
          {caption && (
            <caption>
              <span class={styles.caption}>
                <span class={styles.spacing}></span>

                <span class={styles["caption-inner"]}>
                  <ElmInlineText>{caption}</ElmInlineText>
                </span>

                <span class={styles.spacing}></span>
              </span>
            </caption>
          )}
          <Slot />
        </table>
      </div>
    </div>
  );
});
