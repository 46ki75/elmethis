import {
  component$,
  noSerialize,
  type NoSerialize,
  useSignal,
  useStore,
  useVisibleTask$,
  type CSSProperties,
} from "@builder.io/qwik";

import {
  MessageProcessor,
  Catalog,
  type ComponentApi,
  type SurfaceModel,
} from "@a2ui/web_core/v0_9";
import {
  BASIC_COMPONENTS,
  BASIC_FUNCTIONS,
} from "@a2ui/web_core/v0_9/basic_catalog";

import { ElmA2uiRenderer } from "./elm-a2ui-renderer";

export interface ElmA2uiProps {
  class?: string;
  style?: CSSProperties;

  /** JSONL stream endpoint URL */
  url: string;

  /** Optional HTTP headers for the stream request */
  headers?: Record<string, string>;

  /**
   * Catalog ID declared by the server in `createSurface.catalogId`.
   * Defaults to the A2UI v0.9 standard catalog URI.
   */
  catalogId?: string;
}

/**
 * Fetches a JSONL stream, drives a `MessageProcessor`, and delegates
 * rendering to `ElmA2uiRenderer`.
 */
export const ElmA2ui = component$<ElmA2uiProps>(
  ({ class: className, style, url, headers, catalogId }) => {
    const surfaceMapSig = useSignal<
      NoSerialize<Map<string, SurfaceModel<ComponentApi>>> | undefined
    >();
    const tick = useStore<{ v: number }>({ v: 0 });

    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(async ({ cleanup }) => {
      const catalog = new Catalog(
        catalogId ??
          "https://a2ui.org/specification/v0_9/basic_catalog.json",
        BASIC_COMPONENTS as ComponentApi[],
        BASIC_FUNCTIONS,
      );
      const processor = new MessageProcessor<ComponentApi>([catalog]);

      const surfaceMap = new Map<string, SurfaceModel<ComponentApi>>();
      surfaceMapSig.value = noSerialize(surfaceMap);

      const subCreated = processor.model.onSurfaceCreated.subscribe(
        (surface) => {
          surfaceMap.set(surface.id, surface);
          surface.componentsModel.onCreated.subscribe(() => {
            tick.v++;
          });
          surface.componentsModel.onDeleted.subscribe(() => {
            tick.v++;
          });
          tick.v++;
        },
      );
      const subDeleted = processor.model.onSurfaceDeleted.subscribe((id) => {
        surfaceMap.delete(id);
        tick.v++;
      });

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
                processor.processMessages([JSON.parse(t)]);
                tick.v++;
              } catch {
                /* skip invalid JSON */
              }
            }
          }
          // Flush any trailing data that was not followed by a newline
          const remaining = buf.trim();
          if (remaining) {
            try {
              processor.processMessages([JSON.parse(remaining)]);
              tick.v++;
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

      cleanup(() => {
        subCreated.unsubscribe();
        subDeleted.unsubscribe();
        ctrl.abort();
      });
    });

    return (
      <ElmA2uiRenderer
        surfaceMapSig={surfaceMapSig}
        tick={tick.v}
        class={className}
        style={style}
      />
    );
  },
);
