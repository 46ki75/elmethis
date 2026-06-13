/**
 * Public A2UI v0.9 renderer.
 *
 * Two input modes:
 *   - `url` — fetch a JSONL stream and process each line as a v0.9 message.
 *   - `messages` — render a pre-collected message list (useful for tests).
 *
 * Ported from the qwik lead. Vue has no QRL serialization boundary, so surface
 * state lives in plain (non-reactive) closures and a `tick` ref drives
 * re-render: the SDK's `SurfaceModel`s carry runtime-only references
 * (subscriptions, Maps) that never need to be reactive themselves. Per-component
 * write-back and action dispatch are wired by `ComponentHost`.
 */
import {
  defineComponent,
  onMounted,
  onUnmounted,
  provide,
  ref,
  watch,
  type PropType,
} from "vue";

import {
  Catalog,
  MessageProcessor,
  type ComponentApi,
  type SurfaceModel,
} from "@a2ui/web_core/v0_9";
import {
  BASIC_COMPONENTS,
  BASIC_FUNCTIONS,
} from "@a2ui/web_core/v0_9/basic_catalog";

import { basicCatalog } from "./catalog/basic-catalog";
import { type CatalogRenderer } from "./catalog/catalog";
import {
  A2uiAncestorContext,
  A2uiCatalogContext,
  A2uiSurfaceContext,
  ComponentHost,
  ROOT_COMPONENT_ID,
} from "./component-host";
import { streamJsonLines } from "./stream-json-lines";
import styles from "./elm-a2ui.module.css";

const BASIC_CATALOG_ID =
  "https://a2ui.org/specification/v0_9/basic_catalog.json";

export interface ElmA2uiProps {
  /** A JSONL stream URL. Mutually exclusive with `messages`. */
  url?: string;
  /** Optional headers for the stream `fetch`. */
  headers?: Record<string, string>;
  /** Pre-collected message list (e.g. for tests / Storybook). Mutually exclusive with `url`. */
  messages?: object[];
  /**
   * Catalog id used by `createSurface.catalogId`. Pre-registered so streams
   * may begin emitting `updateComponents` before the first `createSurface`
   * arrives.
   */
  catalogId?: string;
  /**
   * Renderer catalog. Defaults to `basicCatalog`. Extend with
   * `basicCatalog.extend(defineRenderer(...))` to override individual types.
   */
  catalog?: CatalogRenderer;
}

// ---------------------------------------------------------------------------
// SurfaceView — internal: renders one surface. The catalog is provided one
// level up (by ElmA2ui / A2uiSurface) so every surface shares it.
// ---------------------------------------------------------------------------

const SurfaceView = defineComponent({
  name: "A2uiSurfaceView",
  props: {
    surface: {
      type: Object as PropType<SurfaceModel<ComponentApi>>,
      required: true,
    },
  },
  setup(props) {
    provide(A2uiSurfaceContext, props.surface);
    provide(A2uiAncestorContext, []);

    return () => (
      <div
        class={styles.surface}
        style={{ "--elmethis-margin-block-start": "2rem" }}
      >
        <ComponentHost id={ROOT_COMPONENT_ID} basePath="/" />
      </div>
    );
  },
});

// ---------------------------------------------------------------------------
// A2uiSurface — official-style standalone entry point.
//
// External integrations that own their own `MessageProcessor` (the React /
// Angular pattern) can mount this directly with a `SurfaceModel`. `ElmA2ui`
// below wraps it for the `messages` / `url` / `catalogId` convenience API.
// ---------------------------------------------------------------------------

export interface A2uiSurfaceProps {
  /** The `SurfaceModel` to render. */
  surface: SurfaceModel<ComponentApi>;
  /**
   * Active renderer catalog. Provided via `provide`/`inject` so descendant
   * `ComponentHost`s can resolve renderers. Defaults to `basicCatalog`.
   */
  catalog?: CatalogRenderer;
}

export const A2uiSurface = defineComponent({
  name: "A2uiSurface",
  props: {
    surface: {
      type: Object as PropType<SurfaceModel<ComponentApi>>,
      required: true,
    },
    catalog: { type: Object as PropType<CatalogRenderer>, default: undefined },
  },
  setup(props) {
    provide(A2uiCatalogContext, props.catalog ?? basicCatalog);
    provide(A2uiSurfaceContext, props.surface);
    provide(A2uiAncestorContext, []);

    return () => (
      <div
        class={styles.surface}
        style={{ "--elmethis-margin-block-start": "2rem" }}
      >
        <ComponentHost id={ROOT_COMPONENT_ID} basePath="/" />
      </div>
    );
  },
});

// ---------------------------------------------------------------------------
// ElmA2ui — public component.
// ---------------------------------------------------------------------------

interface ProcessorInternal {
  processor: MessageProcessor<ComponentApi>;
  subs: Array<{ unsubscribe(): void }>;
  processed: number;
  // Snapshot of the messages used to build the processor — lets the next run
  // detect prefix-extension vs fresh-stream swap.
  messages: object[];
  catalogId: string | undefined;
}

export const ElmA2ui = defineComponent({
  name: "ElmA2ui",
  props: {
    url: { type: String, default: undefined },
    headers: {
      type: Object as PropType<Record<string, string>>,
      default: undefined,
    },
    messages: { type: Array as PropType<object[]>, default: undefined },
    catalogId: { type: String, default: undefined },
    catalog: { type: Object as PropType<CatalogRenderer>, default: undefined },
  },
  setup(props) {
    // Publish the catalog so child SurfaceViews can resolve renderers.
    provide(A2uiCatalogContext, props.catalog ?? basicCatalog);

    // Messages produced by the URL-driven JSONL reader; the controlled
    // `props.messages` path bypasses it.
    const streamList = ref<object[]>([]);
    // Reactivity driver: bumped by surface create/delete and message
    // processing so the render re-reads the (non-reactive) surface map.
    const tick = ref(0);

    // Non-reactive surface state — `SurfaceModel`s hold runtime refs that don't
    // belong in Vue's reactivity graph; `tick` is what tells Vue to re-render.
    let surfaceMap = new Map<string, SurfaceModel<ComponentApi>>();
    let internal: ProcessorInternal | null = null;

    // Mirrors the qwik lead's unified setup+sync task: diff the effective
    // message list against the last-built state — extension (same prefix, more
    // items, same catalogId) processes only the tail; swap (different prefix or
    // catalogId) tears down and rebuilds, pre-registering every catalogId seen
    // in the new messages so the SDK's constructor-only catalog list stays in
    // sync.
    const syncProcessor = async (): Promise<void> => {
      const propsCatalogId = props.catalogId;
      const effective: object[] = props.messages
        ? [...props.messages]
        : [...streamList.value];

      const existing = internal;
      const isExtension =
        existing !== null &&
        existing.catalogId === propsCatalogId &&
        effective.length >= existing.messages.length &&
        existing.messages.every((m, i) => m === effective[i]);

      if (isExtension && existing) {
        // Append-only path: process whatever's new since the last run.
        const fresh = effective.slice(existing.processed);
        if (!fresh.length) return;
        for (const msg of fresh) {
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            existing.processor.processMessages([msg] as any[]);
          } catch (err) {
            console.warn("[ElmA2ui] skipped invalid A2UI message:", msg, err);
          }
        }
        // The SDK's `EventEmitter.emit` awaits each listener (microtask per
        // iteration). Yield twice so any `onSurfaceCreated` / `onSurfaceDeleted`
        // listeners scheduled by `processMessages` have run before we settle.
        await Promise.resolve();
        await Promise.resolve();
        existing.processed = effective.length;
        existing.messages = effective;
        tick.value++;
        return;
      }

      // Rebuild path: stream swap or catalogId change. Release our own
      // subscriptions, then dispose the previous processor's SurfaceGroupModel
      // so its surfaces release their dataModel / componentsModel / per-surface
      // emitters.
      if (existing) {
        for (const s of existing.subs) s.unsubscribe();
        existing.processor.model.dispose();
      }

      const ids = new Set<string>([BASIC_CATALOG_ID]);
      if (propsCatalogId) ids.add(propsCatalogId);
      for (const m of effective) {
        if (m && typeof m === "object" && "createSurface" in m) {
          const id = (m as { createSurface?: { catalogId?: string } })
            .createSurface?.catalogId;
          if (typeof id === "string") ids.add(id);
        }
      }
      const catalogs = Array.from(ids).map(
        (id) =>
          new Catalog(id, BASIC_COMPONENTS as ComponentApi[], BASIC_FUNCTIONS),
      );
      const processor = new MessageProcessor<ComponentApi>(catalogs);
      const newMap = new Map<string, SurfaceModel<ComponentApi>>();
      const subs: Array<{ unsubscribe(): void }> = [];
      subs.push(
        processor.model.onSurfaceCreated.subscribe((surface) => {
          newMap.set(surface.id, surface);
          tick.value++;
        }),
      );
      subs.push(
        processor.model.onSurfaceDeleted.subscribe((id) => {
          newMap.delete(id);
          tick.value++;
        }),
      );
      surfaceMap = newMap;

      for (const msg of effective) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          processor.processMessages([msg] as any[]);
        } catch (err) {
          console.warn("[ElmA2ui] skipped invalid A2UI message:", msg, err);
        }
      }

      internal = {
        processor,
        subs,
        processed: effective.length,
        messages: effective,
        catalogId: propsCatalogId,
      };
      tick.value++;
    };

    // Identity-based: in-place mutation of the same `props.messages` array
    // won't re-fire — callers must produce a new array reference per tick,
    // matching the React / Angular reference implementations.
    watch(
      [
        () => props.messages,
        () => props.catalogId,
        () => streamList.value.length,
      ],
      () => {
        void syncProcessor();
      },
      { immediate: true },
    );

    // ---- JSONL streaming (only when url is provided) ----
    let ctrl: AbortController | null = null;
    onMounted(() => {
      if (!props.url) return;
      ctrl = new AbortController();
      const signal = ctrl.signal;
      fetch(props.url, { headers: props.headers, signal })
        .then(async (res) => {
          if (!res.body) return;
          await streamJsonLines(res.body, {
            signal,
            onMessage: (m) => {
              if (m && typeof m === "object")
                streamList.value.push(m as object);
            },
            onError: (err, line) => {
              console.warn("[ElmA2ui] skipped invalid JSON line:", line, err);
            },
          });
        })
        .catch((err: unknown) => {
          if (err instanceof Error && err.name !== "AbortError") {
            console.error("[ElmA2ui] stream error:", err);
          }
        });
    });

    onUnmounted(() => {
      ctrl?.abort();
      if (!internal) return;
      for (const s of internal.subs) s.unsubscribe();
      // Dispose the SurfaceGroupModel — cascades into per-surface dispose, so
      // the entire processor graph is released on unmount.
      internal.processor.model.dispose();
    });

    return () => {
      // tick establishes the reactive dep on surface-map mutations.
      void tick.value;
      return (
        <div class={styles["elm-a2ui"]}>
          {Array.from(surfaceMap.values()).map((surface) => (
            <SurfaceView key={surface.id} surface={surface} />
          ))}
        </div>
      );
    };
  },
});
