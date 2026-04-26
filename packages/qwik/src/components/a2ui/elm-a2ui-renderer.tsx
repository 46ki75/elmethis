import {
  component$,
  noSerialize,
  type NoSerialize,
  useSignal,
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

import { ElmA2uiSurfaceRenderer } from "./elm-a2ui-surface-renderer";
import { type CatalogRendererMap } from "./elm-a2ui-catalog-renderer";
import styles from "./elm-a2ui.module.css";

export interface ElmA2uiRendererProps {
  class?: string;
  style?: CSSProperties;
  /** A2UI v0.9 protocol messages to render. */
  messages: unknown[];
  /**
   * Catalog ID to pre-register before messages arrive — useful for streaming
   * where the catalogId is known upfront but createSurface hasn't arrived yet.
   * If omitted, catalog IDs are extracted from the messages array.
   */
  catalogId?: string;
  /**
   * Optional custom catalog renderer map. Falls back to the built-in basic
   * catalog renderer when not provided.
   */
  catalog?: CatalogRendererMap;
}

/** Processes A2UI v0.9 messages and renders each surface via ElmA2uiSurfaceRenderer. */
export const ElmA2uiRenderer = component$<ElmA2uiRendererProps>(
  ({ class: className, style, messages, catalogId, catalog }) => {
    const surfaceMapSig = useSignal<
      NoSerialize<Map<string, SurfaceModel<ComponentApi>>> | undefined
    >();
    const tick = useSignal(0);
    const processorRef = useSignal<
      | NoSerialize<{
          processor: MessageProcessor<ComponentApi>;
          processed: number;
        }>
      | undefined
    >();

    // ---- setup (runs once on mount) ----

    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(({ cleanup }) => {
      const catalogIdSet = new Set<string>();
      if (catalogId) catalogIdSet.add(catalogId);
      for (const m of messages) {
        if (m && typeof m === "object" && "createSurface" in m) {
          const id = (m as { createSurface?: { catalogId?: string } })
            .createSurface?.catalogId;
          if (typeof id === "string") catalogIdSet.add(id);
        }
      }
      catalogIdSet.add(
        "https://a2ui.org/specification/v0_9/basic_catalog.json",
      );

      const catalogs = Array.from(catalogIdSet).map(
        (id) =>
          new Catalog(id, BASIC_COMPONENTS as ComponentApi[], BASIC_FUNCTIONS),
      );
      const processor = new MessageProcessor<ComponentApi>(catalogs);
      const surfaceMap = new Map<string, SurfaceModel<ComponentApi>>();
      surfaceMapSig.value = noSerialize(surfaceMap);

      const subCreated = processor.model.onSurfaceCreated.subscribe(
        (surface) => {
          surfaceMap.set(surface.id, surface);
          tick.value++;
        },
      );
      const subDeleted = processor.model.onSurfaceDeleted.subscribe((id) => {
        surfaceMap.delete(id);
        tick.value++;
      });

      processorRef.value = noSerialize({ processor, processed: 0 });

      cleanup(() => {
        subCreated.unsubscribe();
        subDeleted.unsubscribe();
      });
    });

    // ---- incremental processing (initial batch + streaming updates) ----

    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(({ track }) => {
      track(() => messages.length);
      const internal = processorRef.value;
      if (!internal) return;
      const newMsgs = messages.slice(internal.processed);
      if (!newMsgs.length) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      internal.processor.processMessages(newMsgs as any[]);
      internal.processed = messages.length;
      tick.value++;
    });

    return (
      <div class={[styles["elm-a2ui"], className]} style={style}>
        {tick.value >= 0 &&
          Array.from(surfaceMapSig.value?.values() ?? []).map((surface) => (
            <ElmA2uiSurfaceRenderer
              key={surface.id}
              surface={noSerialize(surface)}
              catalog={catalog}
            />
          ))}
      </div>
    );
  },
);
