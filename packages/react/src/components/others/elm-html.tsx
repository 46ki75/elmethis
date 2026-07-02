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
  // The html value the iframe's `load` event has actually fired for — set
  // only from inside the real `load` handler below, never inferred from
  // prop-diffing. A prop-diffing heuristic (e.g. "did html change since last
  // render?") is fooled by a React StrictMode double-invoke (the second
  // invocation sees no prop change and wrongly assumes the doc already
  // loaded) and by toggling autoHeight off/on around an html change (a
  // navigation can still be in flight when autoHeight turns back on).
  const loadedHtmlRef = useRef<string | undefined>(undefined);

  // Measuring content height needs `allow-same-origin` (to read
  // `contentDocument`), so it's only ever added while `autoHeight` is on —
  // never when a caller's sandbox override already allows scripts (combining
  // allow-scripts with allow-same-origin lets the embedded document escape
  // the sandbox entirely, becoming same-origin with the parent while still
  // able to run script), even at the cost of autoHeight not being able to
  // measure there. The allow-scripts check is case-insensitive: the HTML
  // `sandbox` attribute matches its keywords case-insensitively, so a
  // case-sensitive check here could be defeated by a differently-cased
  // token.
  const sandboxTokens = new Set(sandbox?.split(/\s+/).filter(Boolean) ?? []);
  if (autoHeight) {
    const hasAllowScripts = [...sandboxTokens].some(
      (token) => token.toLowerCase() === "allow-scripts",
    );
    if (!hasAllowScripts) sandboxTokens.add("allow-same-origin");
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
      observer = new ResizeObserver(measure);
      observer.observe(root);
    };

    const onLoad = () => {
      loadedHtmlRef.current = html;
      if (autoHeight) {
        measure();
        attachObserver();
      }
    };

    iframe.addEventListener("load", onLoad);

    if (autoHeight) {
      if (loadedHtmlRef.current === html) {
        // The iframe already finished loading this exact html before this
        // effect ran (e.g. autoHeight just turned on, or a StrictMode
        // remount) — 'load' won't fire again, so sync against the
        // already-settled document directly instead of waiting for it.
        measure();
        attachObserver();
      } else {
        setContentHeight(undefined);
      }
    }

    return () => {
      iframe.removeEventListener("load", onLoad);
      observer?.disconnect();
    };
  }, [html, autoHeight]);

  // `src`/`srcDoc` are excluded from `ElmHtmlProps` only at the type level
  // (`Omit<..., "src" | "srcDoc">`) — a loosely-typed caller can still
  // smuggle one into `rest` at runtime, where spreading it last onto the
  // iframe would silently override our own `srcDoc={html}` below. Strip both
  // defensively so `html` stays the single source of truth for what renders.
  const {
    src: _src,
    srcDoc: _srcDoc,
    ...safeRest
  } = rest as typeof rest & {
    src?: unknown;
    srcDoc?: unknown;
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
      srcDoc={html}
      sandbox={effectiveSandbox}
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
    />
  );
};
