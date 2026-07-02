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
  "src" | "srcDoc"
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

export const ElmHtml = ({
  className,
  html,
  sandbox,
  style,
  height,
  autoHeight = true,
  title,
  ...rest
}: ElmHtmlProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [contentHeight, setContentHeight] = useState<number>();

  // `key={String(autoHeight)}` (below) gives a fresh, unloaded iframe node
  // on an autoHeight toggle, and a plain html change is a fresh navigation
  // too — either way the previously-measured height goes stale the moment
  // `html`/`autoHeight` change, well before the effect that re-measures it
  // gets to run. Resetting it here, during render (React's documented
  // pattern for adjusting state in response to a prop change), avoids an
  // extra render showing the stale value that a reset inside the effect
  // would cause.
  const [loadKey, setLoadKey] = useState({ html, autoHeight });
  if (loadKey.html !== html || loadKey.autoHeight !== autoHeight) {
    setLoadKey({ html, autoHeight });
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

  useEffect(() => {
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
  }, [html, autoHeight]);

  // `src`/`srcDoc` are excluded from `ElmHtmlProps` only at the type level
  // (`Omit<..., "src" | "srcDoc">`) — a loosely-typed caller can still
  // smuggle one into `rest` at runtime, where spreading it last onto the
  // iframe would silently override our own `srcDoc={html}` below. Strip both
  // castings of `srcDoc` (a caller could pass either) defensively so `html`
  // stays the single source of truth for what renders.
  const {
    src: _src,
    srcDoc: _srcDoc,
    srcdoc: _srcdoc,
    ...safeRest
  } = rest as typeof rest & {
    src?: unknown;
    srcDoc?: unknown;
    srcdoc?: unknown;
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
      // same `sandbox`/`srcdoc` DOM attributes. Applying ours last
      // guarantees they always win, regardless of what casing a smuggled key
      // used.
      srcDoc={html}
      sandbox={effectiveSandbox}
    />
  );
};
