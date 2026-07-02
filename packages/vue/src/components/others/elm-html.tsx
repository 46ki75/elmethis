import {
  defineComponent,
  normalizeStyle,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type CSSProperties,
  type HTMLAttributes,
  type PropType,
} from "vue";
import { clsx } from "clsx";

import styles from "./elm-html.module.css";

// `HTMLAttributes["style"]` legally includes a plain CSS-text string (unlike
// react, whose `style` prop is object-only) — vue's own DOM patcher writes a
// string straight to `element.style.cssText` instead of merging it key by
// key. `normalizeStyle` (vue's own array/object merge utility, used
// internally by its DOM patcher) leaves a string untouched rather than
// parsing it, so it can't be used alone here: this component needs a real
// key/value view of the caller's style to merge in a measured `height`, so a
// string has to be parsed into one explicitly.
const parseStyleString = (css: string): CSSProperties => {
  const result: Record<string, string> = {};
  for (const declaration of css.split(";")) {
    const separatorIndex = declaration.indexOf(":");
    if (separatorIndex === -1) continue;
    const property = declaration.slice(0, separatorIndex).trim();
    const value = declaration.slice(separatorIndex + 1).trim();
    if (!property || !value) continue;
    const camelProperty = property.replace(/-([a-z])/g, (_, letter: string) =>
      letter.toUpperCase(),
    );
    result[camelProperty] = value;
  }
  return result as CSSProperties;
};

const toStyleObject = (
  style: HTMLAttributes["style"],
): CSSProperties | undefined => {
  if (style === undefined) return undefined;
  if (typeof style === "string") return parseStyleString(style);
  return normalizeStyle(style) as CSSProperties;
};

export interface ElmHtmlProps extends HTMLAttributes {
  /** Raw HTML markup to render, e.g. a Claude-authored artifact or a Notion page export. */
  html: string;

  /**
   * Stretch the iframe to fit its content height. Set to false to size it
   * yourself instead (via `style`, `height`, or a CSS class).
   * @default true
   */
  autoHeight?: boolean;

  /**
   * Sandbox flags applied to the iframe (space-separated, same syntax as the
   * native `sandbox` attribute). While `autoHeight` is on, `allow-same-origin`
   * is force-added unless this already requests `allow-scripts` (see below).
   */
  sandbox?: string;

  /** Native iframe `height` attribute, in pixels. */
  height?: number | `${number}`;

  /** Accessible name for the iframe. @default "Embedded HTML content" */
  title?: string;
}

export const ElmHtml = defineComponent({
  name: "ElmHtml",
  // Native attrs (class, style, id, `allow`, …) are forwarded onto the
  // <iframe> manually below, same convention as elm-table.tsx.
  inheritAttrs: false,
  props: {
    html: { type: String, required: true },
    autoHeight: { type: Boolean, default: true },
    sandbox: { type: String, default: undefined },
    height: {
      type: [Number, String] as PropType<number | `${number}`>,
      default: undefined,
    },
    title: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    const iframeRef = ref<HTMLIFrameElement | null>(null);
    const contentHeight = ref<number | undefined>(undefined);

    // The `key={String(autoHeight)}` on the <iframe> below (and a plain
    // `html` change, which is a fresh navigation on its own) both make a
    // previously-measured height stale the moment `html`/`autoHeight`
    // change — well before the watcher below that re-measures it gets to
    // run. `flush: "pre"` runs this before the DOM patches, so (unlike
    // react, which needed an awkward render-time-state-adjustment workaround
    // purely to satisfy a lint rule vue doesn't have) there's no stale-paint
    // frame to guard against.
    watch(
      () => [props.html, props.autoHeight] as const,
      ([, autoHeight]) => {
        if (autoHeight) contentHeight.value = undefined;
      },
      { flush: "pre" },
    );

    // ResizeObserver + `load` listener attach/cleanup, rerunning whenever
    // `html`/`autoHeight` change — mirrors react's `useEffect(fn, [html,
    // autoHeight])` cleanup-per-run semantics.
    //
    // This is NOT a single `watch(..., { immediate: true, flush: "post" })`,
    // even though that reads as the obvious vue equivalent. It was tried
    // first and is broken: vue's `watch()` invokes an `immediate: true`
    // callback synchronously, during `setup()`, bypassing the `flush`
    // scheduler entirely for that first call only (verified against
    // `@vue/reactivity`'s `watch()` source — `if (immediate) job(true)` calls
    // the job directly, never through `options.scheduler`). So `flush:
    // "post"` would still leave `iframeRef.value` `null` on the first run,
    // before the <iframe> has even mounted. `onMounted` + a *non-immediate*
    // `flush: "post"` watch for subsequent changes sidesteps that: the first
    // run goes through `onMounted` (which vue does guarantee runs after the
    // DOM is patched), and every later run goes through the watcher's
    // scheduler, which — being a real (non-immediate) trigger — does respect
    // `flush: "post"` correctly.
    let disposeLifecycle: (() => void) | undefined;

    const attachLifecycle = (autoHeight: boolean) => {
      const iframe = iframeRef.value;
      if (!iframe) return;

      let observer: ResizeObserver | undefined;

      const measure = () => {
        const root = iframe.contentDocument?.documentElement;
        if (root) contentHeight.value = root.scrollHeight;
      };

      const attachObserver = () => {
        const root = iframe.contentDocument?.documentElement;
        if (!root) return;
        observer = new ResizeObserver(measure);
        observer.observe(root);
      };

      const onLoad = () => {
        if (autoHeight) {
          measure();
          attachObserver();
        }
      };

      iframe.addEventListener("load", onLoad);
      disposeLifecycle = () => {
        iframe.removeEventListener("load", onLoad);
        observer?.disconnect();
      };
    };

    onMounted(() => attachLifecycle(props.autoHeight));

    watch(
      () => [props.html, props.autoHeight] as const,
      ([, autoHeight]) => {
        disposeLifecycle?.();
        attachLifecycle(autoHeight);
      },
      { flush: "post" },
    );

    onBeforeUnmount(() => disposeLifecycle?.());

    return () => {
      // `src`/`srcdoc` are excluded from `ElmHtmlProps` only at the type
      // level — a loosely-typed caller can still smuggle one into `attrs` at
      // runtime, where spreading it last onto the iframe would silently
      // override our own `srcdoc={props.html}` below. Strip both defensively
      // (both castings of `srcDoc`, since a caller could pass either) so
      // `html` stays the single source of truth for what renders.
      const {
        class: className,
        style,
        src: _src,
        srcDoc: _srcDoc,
        srcdoc: _srcdoc,
        ...safeRest
      } = attrs as Record<string, unknown>;

      const callerStyle = toStyleObject(style as HTMLAttributes["style"]);
      const callerStyleHeight = callerStyle?.height;

      // Measuring content height needs `allow-same-origin` (to read
      // `contentDocument`), so it's only ever present while `autoHeight` is
      // on — never together with allow-scripts (combining allow-scripts with
      // allow-same-origin lets the embedded document escape the sandbox
      // entirely, becoming same-origin with the parent while still able to
      // run script), even at the cost of autoHeight not being able to
      // measure there. This must both never ADD allow-same-origin onto a
      // sandbox that already allows scripts, and never leave one in place if
      // the caller supplied both tokens together directly — otherwise a
      // caller-supplied "allow-scripts allow-same-origin" sandbox would pass
      // straight through unmodified, recreating the exact escape this guard
      // exists to prevent. The allow-scripts check is case-insensitive: the
      // HTML `sandbox` attribute matches its keywords case-insensitively, so
      // a case-sensitive check here could be defeated by a differently-cased
      // token.
      const sandboxTokens = new Set(
        props.sandbox?.split(/\s+/).filter(Boolean) ?? [],
      );
      if (props.autoHeight) {
        const hasAllowScripts = [...sandboxTokens].some(
          (token) => token.toLowerCase() === "allow-scripts",
        );
        if (hasAllowScripts) {
          for (const token of sandboxTokens) {
            if (token.toLowerCase() === "allow-same-origin") {
              sandboxTokens.delete(token);
            }
          }
        } else {
          sandboxTokens.add("allow-same-origin");
        }
      }
      const effectiveSandbox = [...sandboxTokens].join(" ");

      return (
        <iframe
          // The `sandbox` attribute's flags are fixed for a document at the
          // moment its navigation starts — changing the attribute afterward
          // doesn't retroactively apply to whatever's already loaded. Keying
          // on `autoHeight` forces a fresh iframe (and thus a fresh
          // navigation) whenever it toggles, so a switch to
          // `autoHeight={true}` always gets the `allow-same-origin` it needs
          // to measure, instead of being silently stuck with whatever flags
          // applied when autoHeight was off.
          key={String(props.autoHeight)}
          ref={iframeRef}
          title={props.title ?? "Embedded HTML content"}
          class={clsx(styles["elm-html"], className as string | undefined)}
          srcdoc={props.html}
          sandbox={effectiveSandbox}
          style={
            props.autoHeight
              ? ({
                  ...callerStyle,
                  // A number here (unlike react) would produce an invalid,
                  // silently-ignored CSS value in vue — vue does not
                  // auto-append "px" to unitless numeric style values the
                  // way react does — so the measured height is stringified
                  // explicitly, matching this codebase's convention for
                  // pixel style values (see elm-tooltip.tsx).
                  height:
                    contentHeight.value !== undefined
                      ? `${contentHeight.value}px`
                      : callerStyleHeight,
                } as CSSProperties)
              : (callerStyle as CSSProperties | undefined)
          }
          height={
            props.autoHeight
              ? contentHeight.value === undefined &&
                callerStyleHeight === undefined
                ? props.height
                : undefined
              : props.height
          }
          {...safeRest}
        />
      );
    };
  },
});
