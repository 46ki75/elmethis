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
  // unlike React, which camelCases it to `srcDoc`. `src` and `referrerPolicy`
  // are excluded too: both are fully internally-managed (see below), not
  // caller-configurable passthrough.
  "src" | "srcdoc" | "referrerPolicy"
> {
  /**
   * Raw HTML markup to render, e.g. a Claude-authored artifact or a Notion
   * page export. Mutually exclusive with `src` — provide exactly one of the
   * two.
   */
  html?: string;

  /**
   * URL of a remote document to load in place of inline `html` (e.g. a
   * presigned, time-limited link, or a same-origin static asset). Mutually
   * exclusive with `html` — provide exactly one of the two.
   *
   * The framed document always gets `referrerPolicy="no-referrer"` so a
   * token embedded in the URL's query string (as presigned links often
   * carry) can't leak via the `Referer` header on requests the framed page
   * itself makes. `autoHeight` still measures here when the URL happens to
   * be same-origin (or `allow-same-origin` otherwise applies to it, e.g. a
   * `blob:` URL created by this same window) — the browser only blocks
   * `contentDocument` access for a genuinely cross-origin document,
   * regardless of sandbox flags, so that case still can't be measured; size
   * it with `height`/`style` instead. If the URL is time-limited, refreshing
   * it before it expires is the caller's responsibility — this component
   * never retries or reloads on its own.
   */
  src?: string;

  /**
   * Stretch the iframe to fit its content height. Set to false to size it
   * yourself instead (via `style`, `height`, or a CSS class). Has no effect
   * on a genuinely cross-origin `src` — see `src` for why.
   * @default true
   */
  autoHeight?: boolean;

  /**
   * Allow the embedded content to run JavaScript by adding `allow-scripts`
   * to the iframe's `sandbox` attribute. Defaults to false. `allow-same-origin`
   * is never granted together with this — see the sandbox-token logic below
   * for why combining the two would let the embedded document escape the
   * sandbox entirely.
   * @default false
   */
  allowScripts?: boolean;
}

// Shared by both the render body (to decide the sandbox) and the
// `useVisibleTask$` below (to decide the measurement strategy) — kept as a
// module-level pure function rather than a component-scope const so the task
// can call it after independently `track()`ing its inputs, without capturing
// a derived value across the closure boundary (composite values captured
// into a task/QRL closure get misclassified as non-serializable — see
// `qwik/valid-lexical-scope` on `handleOpenInNewTab` in elm-html-viewer.tsx
// for the same pitfall). The check is case-insensitive: the HTML `sandbox`
// attribute matches its keywords case-insensitively, so a case-sensitive
// check here could be defeated by a differently-cased caller-supplied token.
function sandboxHasAllowScripts(
  sandbox: string | undefined,
  allowScripts: boolean,
): boolean {
  if (allowScripts) return true;
  const tokens = sandbox?.split(/\s+/).filter(Boolean) ?? [];
  return tokens.some((token) => token.toLowerCase() === "allow-scripts");
}

// Namespaced so a stray same-shaped message from unrelated page content isn't
// mistaken for a height report; the `event.source` check in the listener
// below is what actually makes this safe against spoofing (it can't be
// forged from message data), this is just collision-avoidance.
const AUTO_HEIGHT_MESSAGE_KIND = "elmethis:elm-html:auto-height";

// Appended (not wrapped) so it always runs after any of the caller's own
// inline scripts, regardless of the document's structure — the HTML parser
// accepts a trailing <script> even with no explicit <body>/</body> in the
// source. Only used when scripts are allowed AND `contentDocument` is opaque
// to the parent (see the sandbox-token guard below), as the sole way left to
// learn the rendered height: `postMessage` crosses the sandbox boundary by
// design, unlike `contentDocument`, so it works under allow-scripts alone,
// without ever needing allow-same-origin.
function withAutoHeightReporter(html: string): string {
  return `${html}
<script>(function () {
  var send = function () {
    try {
      parent.postMessage(
        { kind: ${JSON.stringify(AUTO_HEIGHT_MESSAGE_KIND)}, height: document.documentElement.scrollHeight },
        "*",
      );
    } catch (e) {}
  };
  new ResizeObserver(send).observe(document.documentElement);
  send();
})();</script>`;
}

export const ElmHtml = component$<ElmHtmlProps>((props) => {
  const {
    class: className,
    html,
    src,
    sandbox,
    style,
    height,
    autoHeight = true,
    allowScripts = false,
    title,
    // `srcdoc`/`referrerPolicy` are excluded from `ElmHtmlProps` only at the
    // type level (`Omit<..., ...>`) — a loosely-typed caller can still
    // smuggle one into `rest` at runtime, where spreading it last onto the
    // iframe would silently override our own values below. Strip every
    // casing a caller could plausibly use so `html`/`src` and the
    // no-referrer hardening stay the single source of truth.
    srcdoc: _srcdoc,
    srcDoc: _srcDoc,
    referrerPolicy: _referrerPolicy,
    referrerpolicy: _referrerpolicy,
    ...rest
  } = props as ElmHtmlProps & {
    srcdoc?: unknown;
    srcDoc?: unknown;
    referrerPolicy?: unknown;
    referrerpolicy?: unknown;
  };

  // `html` and `src` are mutually exclusive (enforced by convention/docs,
  // not a runtime check — this catalog doesn't validate cross-field
  // constraints elsewhere either). `src` wins if a caller somehow supplies
  // both.
  const usingSrc = src !== undefined;

  const iframeRef = useSignal<HTMLIFrameElement>();
  const contentHeight = useSignal<number>();

  // Unlike react, no render-time-state-adjustment workaround is needed here:
  // `useTask$` only reruns when a tracked value actually changes, so the
  // stale-height reset simply lives in a task gated on the same values that
  // force a fresh iframe below (`key={String(autoHeight)}` / a plain `html`
  // navigation) — no snapshot/comparison state needed.
  useTask$(({ track }) => {
    track(() => props.html);
    track(() => props.src);
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
  if (allowScripts) sandboxTokens.add("allow-scripts");
  const hasAllowScripts = sandboxHasAllowScripts(sandbox, allowScripts);
  if (hasAllowScripts) {
    for (const token of sandboxTokens) {
      if (token.toLowerCase() === "allow-same-origin") {
        sandboxTokens.delete(token);
      }
    }
  } else if (autoHeight) {
    // Not skipped for `src` mode: a `src` URL that happens to be same-origin
    // (or otherwise gets `allow-same-origin` treatment, e.g. a `blob:` URL
    // created by this same window) genuinely benefits from this — the
    // browser only refuses `contentDocument` access for a truly cross-origin
    // document regardless of sandbox flags, in which case granting this buys
    // nothing but also costs nothing (see the `src` doc comment).
    sandboxTokens.add("allow-same-origin");
  }
  const effectiveSandbox = [...sandboxTokens].join(" ");

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(
    ({ track, cleanup }) => {
      const nextSrc = track(() => props.src);
      track(() => props.html);
      const nextAutoHeight = track(() => props.autoHeight ?? true);
      const nextSandbox = track(() => props.sandbox);
      const nextAllowScripts = track(() => props.allowScripts ?? false);

      const iframe = iframeRef.value;
      if (!iframe) return;
      if (!nextAutoHeight) return;

      const nextHasAllowScripts = sandboxHasAllowScripts(
        nextSandbox,
        nextAllowScripts,
      );

      // In `src` mode there's no markup of ours to inject a reporter script
      // into (the document is whatever the remote URL serves), so once
      // scripts are allowed — and `contentDocument` is therefore opaque, see
      // below — there's no way left to measure at all. Just don't attach
      // anything.
      if (nextSrc !== undefined && nextHasAllowScripts) return;

      // `contentDocument` is opaque whenever scripts are allowed (allow-
      // same-origin is never granted alongside allow-scripts — see the
      // sandbox-token guard above), so the embedded reporter script appended
      // to `srcdoc` below (only present in `html` mode, in this same case)
      // posts its own measured height instead. `postMessage` crosses the
      // sandbox boundary by design, so this works under allow-scripts alone.
      if (nextHasAllowScripts) {
        // The unit layer's createDOM has no real `window` global (unlike a
        // real browser or even SSR) — bail before touching it. The
        // `contentDocument`-based path below never references `window`, so
        // it needs no equivalent guard.
        if (typeof window === "undefined") return;

        const onMessage = (event: MessageEvent) => {
          // `event.source` is set by the browser to the actual sender
          // window and can't be forged via message content, so this alone
          // is sufficient to reject reports from any other frame/page.
          if (event.source !== iframe.contentWindow) return;
          const data = event.data as
            { kind?: unknown; height?: unknown } | null | undefined;
          if (
            !data ||
            data.kind !== AUTO_HEIGHT_MESSAGE_KIND ||
            typeof data.height !== "number"
          ) {
            return;
          }
          contentHeight.value = data.height;
        };
        window.addEventListener("message", onMessage);
        cleanup(() => window.removeEventListener("message", onMessage));
        return;
      }

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
        measure();
        attachObserver();
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
      // same `sandbox`/`srcdoc`/`referrerpolicy` DOM attributes. Applying
      // ours last guarantees they always win, regardless of what casing a
      // smuggled key used.
      //
      // Exactly one of `src`/`srcdoc` is ever set — the HTML spec has
      // `srcdoc` take precedence when both are present, so leaving the
      // other one as `undefined` (never `""`) is required, not cosmetic: a
      // literal `src=""` would self-navigate the iframe to the host page.
      src={usingSrc ? src : undefined}
      srcdoc={
        usingSrc
          ? undefined
          : autoHeight && hasAllowScripts
            ? withAutoHeightReporter(html ?? "")
            : (html ?? "")
      }
      sandbox={effectiveSandbox}
      // Only forced for `src` — a presigned URL's query-string token must
      // never reach a third party via `Referer`. `html`/`srcdoc` content has
      // no URL of its own to leak, so it's left at the caller's/browser's
      // default.
      referrerPolicy={usingSrc ? "no-referrer" : undefined}
    />
  );
});
