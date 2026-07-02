import {
  component$,
  PropsOf,
  useSignal,
  useTask$,
  useVisibleTask$,
  type CSSProperties,
} from "@qwik.dev/core";

import styles from "./elm-html.module.css";

export interface ElmHtmlProps extends Omit<
  PropsOf<"iframe">,
  // Qwik's JSX intrinsics derive prop names straight from the DOM IDL, where
  // this property is spelled all-lowercase (`HTMLIFrameElement.srcdoc`) —
  // unlike React, which camelCases it to `srcDoc`.
  "src" | "srcdoc"
> {
  /** Raw HTML markup to render, e.g. a Claude-authored artifact or a Notion page export. */
  html: string;

  /**
   * Stretch the iframe to fit its content height. Set to false to size it
   * yourself instead (via `style`, `height`, or a CSS class).
   * @default true
   */
  autoHeight?: boolean;
}

export const ElmHtml = component$<ElmHtmlProps>((props) => {
  const {
    class: className,
    html,
    sandbox,
    style,
    height,
    autoHeight = true,
    title,
    // `src`/`srcdoc` are excluded from `ElmHtmlProps` only at the type level
    // (`Omit<..., "src" | "srcdoc">`) — a loosely-typed caller can still
    // smuggle one into `rest` at runtime, where spreading it last onto the
    // iframe would silently override our own `srcdoc={html}` below. Strip
    // both castings of `srcdoc` (a caller could pass either) defensively so
    // `html` stays the single source of truth for what renders.
    src: _src,
    srcdoc: _srcdoc,
    srcDoc: _srcDoc,
    ...rest
  } = props as ElmHtmlProps & {
    src?: unknown;
    srcdoc?: unknown;
    srcDoc?: unknown;
  };

  const iframeRef = useSignal<HTMLIFrameElement>();
  const contentHeight = useSignal<number>();

  // Unlike react, no render-time-state-adjustment workaround is needed here:
  // `useTask$` only reruns when a tracked value actually changes, so the
  // stale-height reset simply lives in a task gated on the same values that
  // force a fresh iframe below (`key={String(autoHeight)}` / a plain `html`
  // navigation) — no snapshot/comparison state needed.
  useTask$(({ track }) => {
    track(() => props.html);
    const nextAutoHeight = track(() => props.autoHeight ?? true);
    if (nextAutoHeight) contentHeight.value = undefined;
  });

  // Measuring content height needs `allow-same-origin` (to read
  // `contentDocument`), so it's only ever ADDED while `autoHeight` is on —
  // never together with allow-scripts (combining allow-scripts with
  // allow-same-origin lets the embedded document escape the sandbox
  // entirely, becoming same-origin with the parent while still able to run
  // script), even at the cost of autoHeight not being able to measure there.
  // The strip below, unlike the add, must run UNCONDITIONALLY — regardless of
  // `autoHeight` — because it's enforcing a global invariant ("these two
  // tokens must never coexist on this iframe"), not just guarding what this
  // component itself adds. Gating the strip on `autoHeight` would let a
  // caller-supplied "allow-scripts allow-same-origin" sandbox pass straight
  // through unmodified whenever `autoHeight={false}`, recreating the exact
  // escape this guard exists to prevent via a different, equally-supported
  // prop combination. The allow-scripts check is case-insensitive: the HTML
  // `sandbox` attribute matches its keywords case-insensitively, so a
  // case-sensitive check here could be defeated by a differently-cased token.
  const sandboxTokens = new Set(sandbox?.split(/\s+/).filter(Boolean) ?? []);
  const hasAllowScripts = [...sandboxTokens].some(
    (token) => token.toLowerCase() === "allow-scripts",
  );
  if (hasAllowScripts) {
    for (const token of sandboxTokens) {
      if (token.toLowerCase() === "allow-same-origin") {
        sandboxTokens.delete(token);
      }
    }
  } else if (autoHeight) {
    sandboxTokens.add("allow-same-origin");
  }
  const effectiveSandbox = [...sandboxTokens].join(" ");

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(
    ({ track, cleanup }) => {
      track(() => props.html);
      const nextAutoHeight = track(() => props.autoHeight ?? true);

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
        if (nextAutoHeight) {
          measure();
          attachObserver();
        }
      };

      iframe.addEventListener("load", onLoad);

      cleanup(() => {
        iframe.removeEventListener("load", onLoad);
        observer?.disconnect();
      });
    },
    { strategy: "document-ready" },
  );

  return (
    <iframe
      // The `sandbox` attribute's flags are fixed for a document at the
      // moment its navigation starts — changing the attribute afterward
      // doesn't retroactively apply to whatever's already loaded. Keying on
      // `autoHeight` forces a fresh iframe (and thus a fresh navigation)
      // whenever it toggles, so a switch to `autoHeight={true}` always gets
      // the `allow-same-origin` it needs to measure, instead of being
      // silently stuck with whatever flags applied when autoHeight was off.
      key={String(autoHeight)}
      ref={iframeRef}
      title={title ?? "Embedded HTML content"}
      class={[styles["elm-html"], className]}
      style={
        autoHeight
          ? ({
              ...(style as CSSProperties),
              height: contentHeight.value ?? (style as CSSProperties)?.height,
            } as CSSProperties)
          : style
      }
      height={
        autoHeight
          ? contentHeight.value === undefined &&
            (style as CSSProperties)?.height === undefined
            ? height
            : undefined
          : height
      }
      {...rest}
      // Both placed after `{...rest}` on purpose: a differently-cased key
      // (e.g. `Sandbox`, `Srcdoc`) smuggled through a loosely-typed props
      // bag isn't caught by the exact-key destructures above, so it
      // survives into `rest` — but `setAttribute` lowercases attribute
      // names for HTML elements, so any such key still resolves to these
      // same `sandbox`/`srcdoc` DOM attributes. Applying ours last
      // guarantees they always win, regardless of what casing a smuggled
      // key used.
      srcdoc={html}
      sandbox={effectiveSandbox}
    />
  );
});
