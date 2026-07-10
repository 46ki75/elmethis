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
// A plain `.split(";")` would cut a value's own `;` in half (e.g. a data
// URI's MIME parameter, `url(data:image/png;base64,...)`), so declarations
// are split only on a `;` outside of any parentheses.
// Parens/quotes inside a quoted string (e.g. `content: '(';`) aren't real
// nesting — they're just characters of the string — so quote state is
// tracked too: once inside a `'`/`"` string, `(`/`)` are ignored and only the
// matching, unescaped closing quote ends it. Without this, a `;` inside a
// quoted value would be split on (corrupting/truncating that declaration),
// and an unmatched `(` inside one would permanently inflate `depth`,
// swallowing every remaining declaration in the string into one malformed
// value.
const splitDeclarations = (css: string): string[] => {
  const declarations: string[] = [];
  let depth = 0;
  let quote: '"' | "'" | undefined;
  let start = 0;
  for (let i = 0; i < css.length; i++) {
    const char = css[i];
    if (quote) {
      if (char === "\\") i++;
      else if (char === quote) quote = undefined;
      continue;
    }
    if (char === '"' || char === "'") quote = char;
    else if (char === "(") depth++;
    else if (char === ")") depth = Math.max(0, depth - 1);
    else if (char === ";" && depth === 0) {
      declarations.push(css.slice(start, i));
      start = i + 1;
    }
  }
  declarations.push(css.slice(start));
  return declarations;
};

const parseStyleString = (css: string): CSSProperties => {
  const result: Record<string, string> = {};
  for (const declaration of splitDeclarations(css)) {
    const separatorIndex = declaration.indexOf(":");
    if (separatorIndex === -1) continue;
    const property = declaration.slice(0, separatorIndex).trim();
    const value = declaration.slice(separatorIndex + 1).trim();
    if (!property || !value) continue;
    // A leading `--` marks a CSS custom property, whose name is
    // case-sensitive and must be left exactly as written.
    const camelProperty = property.startsWith("--")
      ? property
      : property.replace(/-([a-z])/g, (_, letter: string) =>
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
  /**
   * Raw HTML markup to render, e.g. a Claude-authored artifact or a Notion
   * page export. Mutually exclusive with `src` — provide exactly one of the
   * two.
   */
  html?: string;

  /**
   * URL of a remote document to load in place of inline `html` (e.g. a
   * presigned, time-limited link). Mutually exclusive with `html` — provide
   * exactly one of the two.
   *
   * The framed document always gets `referrerpolicy="no-referrer"` so a
   * token embedded in the URL's query string (as presigned links often
   * carry) can't leak via the `Referer` header on requests the framed page
   * itself makes. `autoHeight` has no effect in this mode — the browser
   * blocks `contentDocument` access across origins regardless of sandbox
   * flags, so cross-origin content can never be measured; size it with
   * `height`/`style` instead. If the URL is time-limited, refreshing it
   * before it expires is the caller's responsibility — this component never
   * retries or reloads on its own.
   */
  src?: string;

  /**
   * Stretch the iframe to fit its content height. Set to false to size it
   * yourself instead (via `style`, `height`, or a CSS class). Only takes
   * effect in `html` mode — see `src` for why.
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
    html: { type: String, default: undefined },
    src: { type: String, default: undefined },
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

    // `html` and `src` are mutually exclusive (enforced by convention/docs,
    // not a runtime check — this catalog doesn't validate cross-field
    // constraints elsewhere either). `src` wins if a caller somehow supplies
    // both.
    const usingSrc = () => props.src !== undefined;

    // The `key={String(autoHeight)}` on the <iframe> below (and a plain
    // `html`/`src` change, which is a fresh navigation on its own) both make
    // a previously-measured height stale the moment `html`/`src`/`autoHeight`
    // change — well before the watcher below that re-measures it gets to
    // run. `flush: "pre"` runs this before the DOM patches, so (unlike
    // react, which needed an awkward render-time-state-adjustment workaround
    // purely to satisfy a lint rule vue doesn't have) there's no stale-paint
    // frame to guard against.
    watch(
      () => [props.html, props.src, props.autoHeight] as const,
      ([, , autoHeight]) => {
        if (autoHeight) contentHeight.value = undefined;
      },
      { flush: "pre" },
    );

    // ResizeObserver + `load` listener attach/cleanup, rerunning whenever
    // `html`/`src`/`autoHeight` change — mirrors react's `useEffect(fn,
    // [html, usingSrc, autoHeight])` cleanup-per-run semantics.
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
      // Cross-origin `src` content can never be measured (see the `src` doc
      // comment) — don't attempt it, and don't attach a load listener that
      // could never do anything useful.
      if (usingSrc()) return;

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
        observer?.disconnect();
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
      () => [props.html, props.src, props.autoHeight] as const,
      ([, , autoHeight]) => {
        disposeLifecycle?.();
        attachLifecycle(autoHeight);
      },
      { flush: "post" },
    );

    onBeforeUnmount(() => disposeLifecycle?.());

    return () => {
      const usingSrcValue = usingSrc();

      // `srcdoc`/`referrerpolicy` are excluded from `ElmHtmlProps` only at
      // the type level — a loosely-typed caller can still smuggle one into
      // `attrs` at runtime, where spreading it last onto the iframe would
      // silently override our own values below. Strip every casing a caller
      // could plausibly use so `html`/`src` and the no-referrer hardening
      // stay the single source of truth.
      const {
        class: className,
        style,
        srcDoc: _srcDoc,
        srcdoc: _srcdoc,
        referrerPolicy: _referrerPolicy,
        referrerpolicy: _referrerpolicy,
        ...safeRest
      } = attrs as Record<string, unknown>;

      const callerStyle = toStyleObject(style as HTMLAttributes["style"]);
      const callerStyleHeight = callerStyle?.height;

      // Measuring content height needs `allow-same-origin` (to read
      // `contentDocument`), so it's only ever ADDED while `autoHeight` is on
      // — never together with allow-scripts (combining allow-scripts with
      // allow-same-origin lets the embedded document escape the sandbox
      // entirely, becoming same-origin with the parent while still able to
      // run script), even at the cost of autoHeight not being able to
      // measure there. The strip below, unlike the add, must run
      // UNCONDITIONALLY — regardless of `autoHeight` — because it's
      // enforcing a global invariant ("these two tokens must never coexist
      // on this iframe"), not just guarding what this component itself
      // adds. Gating the strip on `autoHeight` would let a caller-supplied
      // "allow-scripts allow-same-origin" sandbox pass straight through
      // unmodified whenever `autoHeight: false`, recreating the exact escape
      // this guard exists to prevent via a different, equally-supported prop
      // combination. The allow-scripts check is case-insensitive: the HTML
      // `sandbox` attribute matches its keywords case-insensitively, so a
      // case-sensitive check here could be defeated by a differently-cased
      // token.
      const sandboxTokens = new Set(
        props.sandbox?.split(/\s+/).filter(Boolean) ?? [],
      );
      const hasAllowScripts = [...sandboxTokens].some(
        (token) => token.toLowerCase() === "allow-scripts",
      );
      if (hasAllowScripts) {
        for (const token of sandboxTokens) {
          if (token.toLowerCase() === "allow-same-origin") {
            sandboxTokens.delete(token);
          }
        }
      } else if (props.autoHeight && !usingSrcValue) {
        // Cross-origin `src` content can never expose `contentDocument`
        // (the browser blocks it regardless of sandbox flags — see the
        // `src` doc comment), so granting allow-same-origin here would buy
        // nothing; only widen the sandbox for no benefit.
        sandboxTokens.add("allow-same-origin");
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
          // Both placed after `{...safeRest}` on purpose: a differently-cased
          // key (e.g. `Sandbox`, `Srcdoc`) smuggled through `attrs` isn't
          // caught by Vue's exact-key prop/destructure matching above, so it
          // survives into `safeRest` — but `setAttribute` lowercases
          // attribute names for HTML elements, so any such key still
          // resolves to these same `sandbox`/`srcdoc`/`referrerpolicy` DOM
          // attributes. Applying ours last guarantees they always win,
          // regardless of what casing a smuggled key used.
          //
          // Exactly one of `src`/`srcdoc` is ever set — the HTML spec has
          // `srcdoc` take precedence when both are present, so leaving the
          // other one as `undefined` (never `""`) is required, not
          // cosmetic: a literal `src=""` would self-navigate the iframe to
          // the host page.
          src={usingSrcValue ? props.src : undefined}
          srcdoc={usingSrcValue ? undefined : (props.html ?? "")}
          sandbox={effectiveSandbox}
          // Only forced for `src` — a presigned URL's query-string token
          // must never reach a third party via `Referer`. `html`/`srcdoc`
          // content has no URL of its own to leak, so it's left at the
          // caller's/browser's default.
          referrerpolicy={usingSrcValue ? "no-referrer" : undefined}
        />
      );
    };
  },
});
