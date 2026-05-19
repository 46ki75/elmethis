/**
 * Public A2UI v0.9 renderer.
 *
 * Two input modes:
 *   - `url` — fetch a JSONL stream and process each line as a v0.9 message.
 *   - `messages` — render a pre-collected message list (useful for tests).
 *
 * Surface state lives in `NoSerialize`-wrapped models because `SurfaceModel`
 * holds runtime-only references (subscriptions, Maps). Per-component
 * write-back and action dispatch are wired by `ComponentHost` — renderers
 * call `setBinding$` / `dispatchAction$` QRLs directly, so this component
 * no longer mounts a surface-level event delegator.
 */
import {
  component$,
  noSerialize,
  type NoSerialize,
  useContextProvider,
  useSignal,
  useStore,
  useTask$,
  useVisibleTask$,
  type CSSProperties,
} from "@qwik.dev/core";

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
  class?: string;
  style?: CSSProperties;
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
// A2uiSurface — official-style standalone entry point.
//
// External integrations that own their own `MessageProcessor` (the React /
// Angular pattern) can mount this directly with a `NoSerialize`-wrapped
// `SurfaceModel`. `ElmA2ui` below wraps it for the
// `messages` / `url` / `catalogId` convenience API.
// ---------------------------------------------------------------------------

export interface A2uiSurfaceProps {
  /**
   * The `SurfaceModel` to render. Must be wrapped in `noSerialize()` because
   * it carries non-serializable runtime references (subscriptions, Maps).
   */
  surface: NoSerialize<SurfaceModel<ComponentApi>>;
  /**
   * Active renderer catalog. Provided via context so descendant
   * `ComponentHost`s can resolve renderers without crossing a QRL
   * serialization boundary. Defaults to `basicCatalog` when omitted.
   */
  catalog?: CatalogRenderer;
}

export const A2uiSurface = component$<A2uiSurfaceProps>((props) => {
  useContextProvider(
    A2uiCatalogContext,
    noSerialize(props.catalog ?? basicCatalog),
  );
  useContextProvider(A2uiSurfaceContext, props.surface);
  useContextProvider(A2uiAncestorContext, []);

  return (
    <div
      class={styles.surface}
      style={{ "--elmethis-margin-block-start": "2rem" }}
    >
      <ComponentHost id={ROOT_COMPONENT_ID} basePath="/" />
    </div>
  );
});

// SurfaceView is kept as an internal alias for `A2uiSurface`-without-its-own
// catalog provider, used by `ElmA2ui` which provides the catalog at a
// higher level (so every surface in a single ElmA2ui shares one catalog).
const SurfaceView = component$<{
  surface: NoSerialize<SurfaceModel<ComponentApi>>;
}>((props) => {
  useContextProvider(A2uiSurfaceContext, props.surface);
  useContextProvider(A2uiAncestorContext, []);

  return (
    <div
      class={styles.surface}
      style={{ "--elmethis-margin-block-start": "2rem" }}
    >
      <ComponentHost id={ROOT_COMPONENT_ID} basePath="/" />
    </div>
  );
});

// ---------------------------------------------------------------------------
// ElmA2ui — public component.
// ---------------------------------------------------------------------------

export const ElmA2ui = component$<ElmA2uiProps>((props) => {
  const { class: className, style, url, headers, catalog } = props;
  const userCatalog = catalog ?? basicCatalog;
  // Publish the catalog through context so child SurfaceViews can resolve
  // renderers without the catalog ever crossing a QRL serialization point.
  useContextProvider(A2uiCatalogContext, noSerialize(userCatalog));

  // The stream store holds messages produced by the URL-driven JSONL
  // reader; the controlled-mode `props.messages` path bypasses it. The
  // unified setup task below picks whichever is active.
  const streamStore = useStore<{ list: object[] }>({ list: [] });

  const surfaceMapSig = useSignal<
    NoSerialize<Map<string, SurfaceModel<ComponentApi>>> | undefined
  >();
  const tick = useSignal(0);
  const processorRef = useSignal<
    NoSerialize<{
      processor: MessageProcessor<ComponentApi>;
      subs: Array<{ unsubscribe(): void }>;
      processed: number;
      // Snapshot of the messages used to build the processor — lets the
      // next run detect prefix-extension vs fresh-stream swap without an
      // external signal.
      messages: object[];
      catalogId: string | undefined;
    }>
  >();

  // ---- unified setup + sync + processing ----
  // Tracks `props.messages` identity, `props.catalogId`, AND the URL
  // stream's `streamStore.list.length`. On each fire it diffs against the
  // last-built state in `processorRef`:
  //   - extension (same prefix, more items, same catalogId) → process tail
  //   - swap (different prefix, or catalogId changed)       → tear down
  //                                                            and rebuild
  // The rebuild scans the new messages for `createSurface.catalogId`s and
  // pre-registers them so the SDK's constructor-only catalog list is
  // always in sync with what's about to be processed. This is what fixes
  // round-2 #3 (stream swap) and #6 (catalogId reactivity).
  // Component-scoped cleanup. This task tracks nothing so its cleanup fires
  // only on unmount — NOT between re-runs of the unified setup task below.
  // Without this split the unified task's cleanup would tear down the
  // subscriptions every time `props.messages` changes, even on the
  // extension path that wants to keep them alive.
  useTask$(({ cleanup }) => {
    cleanup(() => {
      const internal = processorRef.value;
      if (!internal) return;
      for (const s of internal.subs) s.unsubscribe();
      // Dispose the SurfaceGroupModel — cascades into per-surface dispose
      // (dataModel + componentsModel + per-surface EventEmitters), so the
      // entire processor graph is released when the component unmounts.
      internal.processor.model.dispose();
    });
  });

  useTask$(async ({ track }) => {
    // `track` is identity-based on the property reference. In-place
    // mutation of the same array (e.g. `props.messages.push(...)`) won't
    // re-fire this task — callers must produce a new array reference per
    // tick, matching the React/Angular reference implementations.
    const propsMessages = track(() => props.messages);
    const propsCatalogId = track(() => props.catalogId);
    track(() => streamStore.list.length);

    // Pick the controlled (props.messages) vs. uncontrolled (URL stream)
    // input. They're documented as mutually exclusive.
    const effective: object[] = propsMessages
      ? [...propsMessages]
      : [...streamStore.list];

    const existing = processorRef.value;
    const isExtension =
      existing !== undefined &&
      existing.catalogId === propsCatalogId &&
      effective.length >= existing.messages.length &&
      existing.messages.every((m, i) => m === effective[i]);

    if (isExtension) {
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
      // The SDK's `EventEmitter.emit` awaits each listener (microtask
      // per iteration). Yield twice so any `onSurfaceCreated` /
      // `onSurfaceDeleted` listeners scheduled by `processMessages`
      // have run before the task resolves — otherwise the surface map
      // mutation lands after Qwik has already settled the re-render.
      await Promise.resolve();
      await Promise.resolve();
      processorRef.value = noSerialize({
        ...existing,
        processed: effective.length,
        messages: effective,
      });
      tick.value++;
      return;
    }

    // Rebuild path: stream swap or catalogId change. Release our own
    // surface-map subscriptions, then dispose the previous processor's
    // SurfaceGroupModel so its surfaces release their dataModel /
    // componentsModel / per-surface emitters. Without this the old
    // surface graph stays pinned in memory across every stream swap.
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
    const surfaceMap = new Map<string, SurfaceModel<ComponentApi>>();
    const subs: Array<{ unsubscribe(): void }> = [];
    subs.push(
      processor.model.onSurfaceCreated.subscribe((surface) => {
        surfaceMap.set(surface.id, surface);
        tick.value++;
      }),
    );
    subs.push(
      processor.model.onSurfaceDeleted.subscribe((id) => {
        surfaceMap.delete(id);
        tick.value++;
      }),
    );
    surfaceMapSig.value = noSerialize(surfaceMap);

    for (const msg of effective) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        processor.processMessages([msg] as any[]);
      } catch (err) {
        console.warn("[ElmA2ui] skipped invalid A2UI message:", msg, err);
      }
    }

    processorRef.value = noSerialize({
      processor,
      subs,
      processed: effective.length,
      messages: effective,
      catalogId: propsCatalogId,
    });
    tick.value++;
  });

  // ---- JSONL streaming (only when url is provided) ----
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    if (!url) return;
    const ctrl = new AbortController();
    fetch(url, { headers, signal: ctrl.signal })
      .then(async (res) => {
        if (!res.body) return;
        await streamJsonLines(res.body, {
          signal: ctrl.signal,
          onMessage: (m) => {
            if (m && typeof m === "object") streamStore.list.push(m as object);
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
    cleanup(() => ctrl.abort());
  });

  return (
    <div class={[styles["elm-a2ui"], className]} style={style}>
      {/* tick establishes a reactive dep on surfaceMapSig mutations. */}
      {tick.value >= 0 &&
        Array.from(surfaceMapSig.value?.values() ?? []).map((surface) => (
          <SurfaceView key={surface.id} surface={noSerialize(surface)} />
        ))}
    </div>
  );
});
