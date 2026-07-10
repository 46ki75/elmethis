import {
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
} from "react";
import { clsx } from "clsx";

import styles from "./elm-html.module.css";

export interface ElmHtmlProps extends Omit<
  ComponentPropsWithoutRef<"iframe">,
  "src" | "srcDoc" | "referrerPolicy"
> {
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
   * The framed document always gets `referrerPolicy="no-referrer"` so a
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
   * Allow the embedded content to run JavaScript by adding `allow-scripts`
   * to the iframe's `sandbox` attribute. Defaults to false. `allow-same-origin`
   * is never granted together with this — see the sandbox-token logic below
   * for why combining the two would let the embedded document escape the
   * sandbox entirely.
   * @default false
   */
  allowScripts?: boolean;
}

export const ElmHtml = ({
  className,
  html,
  src,
  sandbox,
  style,
  height,
  autoHeight = true,
  allowScripts = false,
  title,
  ...rest
}: ElmHtmlProps) => {
  // `html` and `src` are mutually exclusive (enforced by convention/docs,
  // not a runtime check — this catalog doesn't validate cross-field
  // constraints elsewhere either). `src` wins if a caller somehow supplies
  // both.
  const usingSrc = src !== undefined;

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [contentHeight, setContentHeight] = useState<number>();

  // `key={String(autoHeight)}` (below) gives a fresh, unloaded iframe node
  // on an autoHeight toggle, and a plain html/src change is a fresh
  // navigation too — either way the previously-measured height goes stale
  // the moment `html`/`src`/`autoHeight` change, well before the effect that
  // re-measures it gets to run. Resetting it here, during render (React's
  // documented pattern for adjusting state in response to a prop change),
  // avoids an extra render showing the stale value that a reset inside the
  // effect would cause.
  const [loadKey, setLoadKey] = useState({ html, src, autoHeight });
  if (
    loadKey.html !== html ||
    loadKey.src !== src ||
    loadKey.autoHeight !== autoHeight
  ) {
    setLoadKey({ html, src, autoHeight });
    if (autoHeight) setContentHeight(undefined);
  }

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
  const hasAllowScripts = [...sandboxTokens].some(
    (token) => token.toLowerCase() === "allow-scripts",
  );
  if (hasAllowScripts) {
    for (const token of sandboxTokens) {
      if (token.toLowerCase() === "allow-same-origin") {
        sandboxTokens.delete(token);
      }
    }
  } else if (autoHeight && !usingSrc) {
    // Cross-origin `src` content can never expose `contentDocument` (the
    // browser blocks it regardless of sandbox flags — see the `src` doc
    // comment), so granting allow-same-origin here would buy nothing; only
    // widen the sandbox for no benefit.
    sandboxTokens.add("allow-same-origin");
  }
  const effectiveSandbox = [...sandboxTokens].join(" ");

  useEffect(() => {
    // Cross-origin `src` content can never be measured (see the `src` doc
    // comment) — don't attempt it, and don't attach a load listener that
    // could never do anything useful.
    if (usingSrc) return;

    const iframe = iframeRef.current;
    if (!iframe) return;

    let observer: ResizeObserver | undefined;

    const measure = () => {
      const root = iframe.contentDocument?.documentElement;
      if (root) setContentHeight(root.scrollHeight);
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

    return () => {
      iframe.removeEventListener("load", onLoad);
      observer?.disconnect();
    };
  }, [html, usingSrc, autoHeight]);

  // `srcDoc`/`referrerPolicy` are excluded from `ElmHtmlProps` only at the
  // type level (`Omit<..., ...>`) — a loosely-typed caller can still smuggle
  // one into `rest` at runtime, where spreading it last onto the iframe
  // would silently override our own values below. Strip every casing a
  // caller could plausibly use so `html`/`src` and the no-referrer hardening
  // stay the single source of truth.
  const {
    srcDoc: _srcDoc,
    srcdoc: _srcdoc,
    referrerPolicy: _referrerPolicy,
    referrerpolicy: _referrerpolicy,
    ...safeRest
  } = rest as typeof rest & {
    srcDoc?: unknown;
    srcdoc?: unknown;
    referrerPolicy?: unknown;
    referrerpolicy?: unknown;
  };

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
      className={clsx(styles["elm-html"], className)}
      style={
        autoHeight
          ? { ...style, height: contentHeight ?? style?.height }
          : style
      }
      height={
        autoHeight
          ? contentHeight === undefined && style?.height === undefined
            ? height
            : undefined
          : height
      }
      {...safeRest}
      // Both placed after `{...safeRest}` on purpose: a differently-cased
      // key (e.g. `Sandbox`, `Srcdoc`) smuggled through a loosely-typed
      // props bag isn't caught by the exact-key destructures above, so it
      // survives into `safeRest` — but `setAttribute` lowercases attribute
      // names for HTML elements, so any such key still resolves to these
      // same `sandbox`/`srcdoc`/`referrerpolicy` DOM attributes. Applying
      // ours last guarantees they always win, regardless of what casing a
      // smuggled key used.
      //
      // Exactly one of `src`/`srcDoc` is ever set — the HTML spec has
      // `srcDoc` take precedence when both are present, so leaving the
      // other one as `undefined` (never `""`) is required, not cosmetic: a
      // literal `src=""` would self-navigate the iframe to the host page.
      src={usingSrc ? src : undefined}
      srcDoc={usingSrc ? undefined : (html ?? "")}
      sandbox={effectiveSandbox}
      // Only forced for `src` — a presigned URL's query-string token must
      // never reach a third party via `Referer`. `html`/`srcDoc` content has
      // no URL of its own to leak, so it's left at the caller's/browser's
      // default.
      referrerPolicy={usingSrc ? "no-referrer" : undefined}
    />
  );
};
