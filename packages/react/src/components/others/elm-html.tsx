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
  const prevHtmlRef = useRef<string | undefined>(undefined);

  // Measuring content height needs `allow-same-origin` (to read
  // `contentDocument`). We add it to a caller-supplied `sandbox` override
  // automatically — UNLESS they've also requested `allow-scripts`: combining
  // allow-scripts with allow-same-origin lets the embedded document escape
  // the sandbox entirely (it becomes same-origin with the parent while still
  // able to run script), so that one combination is never auto-added, even
  // at the cost of autoHeight not being able to measure.
  const sandboxTokens = new Set(sandbox?.split(/\s+/).filter(Boolean) ?? []);
  if (!sandboxTokens.has("allow-scripts"))
    sandboxTokens.add("allow-same-origin");
  const effectiveSandbox = [...sandboxTokens].join(" ");

  useEffect(() => {
    if (!autoHeight) {
      prevHtmlRef.current = html;
      return;
    }

    // Only trust an already-loaded document when html didn't just change —
    // right after an html change the iframe may still be navigating, so its
    // contentDocument can transiently be the outgoing document.
    const htmlUnchanged = prevHtmlRef.current === html;
    prevHtmlRef.current = html;
    if (!htmlUnchanged) setContentHeight(undefined);

    const iframe = iframeRef.current;
    if (!iframe) return;

    let observer: ResizeObserver | undefined;

    const measure = () => {
      const root = iframe.contentDocument?.documentElement;
      if (root) setContentHeight(root.scrollHeight);
    };

    const sync = () => {
      measure();
      const root = iframe.contentDocument?.documentElement;
      if (root && !observer) {
        observer = new ResizeObserver(measure);
        observer.observe(root);
      }
    };

    iframe.addEventListener("load", sync);
    // autoHeight may have just turned on for content that's already loaded
    // (html unchanged), in which case 'load' won't fire again to sync it.
    if (htmlUnchanged) sync();

    return () => {
      iframe.removeEventListener("load", sync);
      observer?.disconnect();
    };
  }, [html, autoHeight]);

  return (
    <iframe
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
      {...rest}
    />
  );
};
