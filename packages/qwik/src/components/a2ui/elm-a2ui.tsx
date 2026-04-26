import {
  component$,
  useStore,
  useVisibleTask$,
  type CSSProperties,
} from "@builder.io/qwik";

import { ElmA2uiRenderer } from "./elm-a2ui-renderer";
import { type CatalogRendererMap } from "./elm-a2ui-catalog-renderer";

export interface ElmA2uiProps {
  class?: string;
  style?: CSSProperties;

  /** JSONL stream endpoint URL */
  url: string;

  /** Optional HTTP headers for the stream request */
  headers?: Record<string, string>;

  /**
   * Catalog ID declared by the server in `createSurface.catalogId`.
   * Pre-registers the catalog before the first message arrives.
   */
  catalogId?: string;

  /**
   * Optional custom catalog renderer map. Falls back to the built-in basic
   * catalog renderer when not provided.
   */
  catalog?: CatalogRendererMap;
}

/**
 * Fetches a JSONL stream and delegates rendering to `ElmA2uiRenderer`.
 */
export const ElmA2ui = component$<ElmA2uiProps>(
  ({ class: className, style, url, headers, catalogId, catalog }) => {
    const messagesStore = useStore<{ list: unknown[] }>({ list: [] });

    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(async ({ cleanup }) => {
      const ctrl = new AbortController();
      fetch(url, { headers, signal: ctrl.signal })
        .then(async (res) => {
          if (!res.body) return;
          const reader = res.body.getReader();
          const dec = new TextDecoder();
          let buf = "";
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            buf += dec.decode(value, { stream: true });
            const lines = buf.split("\n");
            buf = lines.pop() ?? "";
            for (const line of lines) {
              const t = line.trim();
              if (!t) continue;
              try {
                messagesStore.list.push(JSON.parse(t));
              } catch {
                /* skip invalid JSON */
              }
            }
          }
          const remaining = buf.trim();
          if (remaining) {
            try {
              messagesStore.list.push(JSON.parse(remaining));
            } catch {
              /* skip invalid JSON */
            }
          }
        })
        .catch((err: unknown) => {
          if (err instanceof Error && err.name !== "AbortError") {
            console.error("[ElmA2ui] stream error:", err);
          }
        });

      cleanup(() => ctrl.abort());
    });

    return (
      <ElmA2uiRenderer
        messages={messagesStore.list}
        catalogId={catalogId}
        catalog={catalog}
        class={className}
        style={style}
      />
    );
  },
);
