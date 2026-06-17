import {
  computed,
  defineComponent,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  type HTMLAttributes,
} from "vue";
import { clsx } from "clsx";

import styles from "./elm-table.module.css";
import textStyles from "../../styles/text.module.css";
import { ElmInlineText } from "../typography/elm-inline-text";
import { HasRowHeaderContext } from "./table-context";

export interface ElmTableProps extends HTMLAttributes {
  caption?: string;

  hasRowHeader?: boolean;
}

export const ElmTable = defineComponent({
  name: "ElmTable",
  // Wrappers now sit above <table>, so attr fallthrough is disabled and the
  // native attrs (class, id, style, listeners…) are forwarded onto <table>
  // manually below — matching where they landed before the wrappers existed.
  inheritAttrs: false,
  props: {
    caption: { type: String, default: undefined },
    hasRowHeader: { type: Boolean, default: false },
  },
  setup(props, { attrs, slots }) {
    provide(
      HasRowHeaderContext,
      computed(() => props.hasRowHeader),
    );

    // Horizontal-overflow state, mirrored from the scroll container so the
    // table can expose a keyboard-focusable, labeled scroll region only while
    // it overflows and reveal edge shadows that hint at columns past the
    // viewport. Stays false during SSR, so the scroll affordances are pure
    // progressive enhancement and never reach the server markup.
    const scrollRef = ref<HTMLDivElement | null>(null);
    const canScroll = ref(false);
    const atStart = ref(true);
    const atEnd = ref(true);

    const measure = () => {
      const el = scrollRef.value;
      if (el == null) return;
      const max = el.scrollWidth - el.clientWidth;
      canScroll.value = max > 1;
      atStart.value = el.scrollLeft <= 1;
      atEnd.value = el.scrollLeft >= max - 1;
    };

    let observer: ResizeObserver | null = null;
    onMounted(() => {
      const el = scrollRef.value;
      if (el == null) return;
      measure();
      el.addEventListener("scroll", measure, { passive: true });
      // Guarded for the jsdom test env, which lacks ResizeObserver.
      if (typeof ResizeObserver !== "undefined") {
        observer = new ResizeObserver(measure);
        observer.observe(el);
      }
    });
    onBeforeUnmount(() => {
      scrollRef.value?.removeEventListener("scroll", measure);
      observer?.disconnect();
    });

    return () => {
      const { class: className, ...restAttrs } = attrs as Record<
        string,
        unknown
      >;

      return (
        <div
          class={styles["elm-table-frame"]}
          data-overflow-start={
            canScroll.value && !atStart.value ? "" : undefined
          }
          data-overflow-end={canScroll.value && !atEnd.value ? "" : undefined}
        >
          <div
            ref={scrollRef}
            class={styles["elm-table-scroll"]}
            tabindex={canScroll.value ? 0 : undefined}
            role={
              canScroll.value && props.caption != null ? "region" : undefined
            }
            aria-label={
              canScroll.value && props.caption != null
                ? props.caption
                : undefined
            }
          >
            <table
              class={clsx(
                styles["elm-table"],
                textStyles.text,
                props.hasRowHeader && styles["sticky-row-header"],
                className as string | undefined,
              )}
              {...restAttrs}
            >
              {props.caption && (
                <caption>
                  <span class={styles.caption}>
                    <span class={styles.spacing}></span>

                    <span class={styles["caption-inner"]}>
                      <ElmInlineText>{props.caption}</ElmInlineText>
                    </span>

                    <span class={styles.spacing}></span>
                  </span>
                </caption>
              )}
              {slots.default?.()}
            </table>
          </div>
        </div>
      );
    };
  },
});
