import type { Mermaid } from "mermaid";
import React, { useEffect, useRef, useState } from "react";

import "@styles/global.css";
import styles from "./ElmMermaid.module.css";
import type { ElmethisCSSVariables } from "@styles/variables";

export type ElmMermaidCSSVariables = Pick<
  ElmethisCSSVariables,
  "--elmethis-margin-block-start"
>;

export interface ElmMermaidProps {
  style?: React.CSSProperties & ElmMermaidCSSVariables;

  /**
   * The Mermaid diagram code to render.
   */
  code: string;
}

// Global cache shared across all instances
const globalMermaidCache = {
  instance: null as Mermaid | null,
  svgCache: new Map<string, string>(),
};

let renderCounter = 0;

function getCacheKey(code: string): string {
  let hash = 0;
  for (let i = 0; i < code.length; i++) {
    const char = code.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return `mermaid-${hash}`;
}

export const ElmMermaid = ({ code, style }: ElmMermaidProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    let cancelled = false;
    setIsRendered(false);

    const render = async () => {
      try {
        const cacheKey = getCacheKey(code);

        if (globalMermaidCache.svgCache.has(cacheKey)) {
          if (!cancelled && containerRef.current) {
            containerRef.current.innerHTML =
              globalMermaidCache.svgCache.get(cacheKey)!;
            setIsRendered(true);
          }
          return;
        }

        if (!globalMermaidCache.instance) {
          const { default: mermaid } = await import("mermaid");
          mermaid.initialize({
            startOnLoad: false,
            theme: "base",
            themeVariables: {
              mainBkg: "#fbfcff",
              lineColor: "#606875",
              primaryColor: "#6c7483",
              secondaryColor: "#e9dec5",
              tertiaryColor: "#f5f6f8",
              tertiaryBorderColor: "#e2d4b2",
              tertiaryTextColor: "#b69545",
              signalColor: "#949ba7",
            },
          });
          globalMermaidCache.instance = mermaid;
        }

        const renderId = `mermaid-react-${++renderCounter}`;
        const { svg } = await globalMermaidCache.instance.render(
          renderId,
          code,
        );

        globalMermaidCache.svgCache.set(cacheKey, svg);

        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
          setIsRendered(true);
        }
      } catch (err) {
        console.error("Mermaid render error:", err);
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = `<pre>${code}</pre>`;
          setIsRendered(true);
        }
      }
    };

    render();

    return () => {
      cancelled = true;
    };
  }, [code]);

  return (
    <div
      ref={containerRef}
      className={`${styles.mermaid} ${isRendered ? styles.rendered : styles.raw}`}
      style={style}
    />
  );
};
