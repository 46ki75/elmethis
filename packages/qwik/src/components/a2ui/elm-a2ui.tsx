/**
 * Public A2UI v0.9 renderer.
 *
 * Two input modes:
 *   - `url` — fetch a JSONL stream and process each line as a v0.9 message.
 *   - `messages` — render a pre-collected message list (useful for tests).
 *
 * Surface state lives in `NoSerialize`-wrapped models because `SurfaceModel`
 * holds runtime-only references (subscriptions, Maps). Event delegation lives
 * on the surface container — renderers emit `data-a2ui-bind` / `data-a2ui-action`
 * attributes via the `RenderArgs.bindValue` / `bindAction` helpers and the
 * delegator below routes events back into the data model and action stream.
 */
import {
  component$,
  createContextId,
  noSerialize,
  type NoSerialize,
  useContext,
  useContextProvider,
  useSignal,
  useStore,
  useTask$,
  useVisibleTask$,
  type CSSProperties,
} from "@qwik.dev/core";

import {
  Catalog,
  ComponentContext,
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
import { renderSurface } from "./render-tree";
import { streamJsonLines } from "./stream-json-lines";
import styles from "./elm-a2ui.module.css";

const BASIC_CATALOG_ID =
  "https://a2ui.org/specification/v0_9/basic_catalog.json";

/**
 * Holds the active `CatalogRenderer` so internal `SurfaceView`s can resolve
 * renderers without serializing the catalog across a QRL boundary. Wrapped in
 * `NoSerialize` because catalogs carry plain render functions Qwik can't
 * serialize.
 */
const A2uiCatalogContext = createContextId<
  NoSerialize<CatalogRenderer> | undefined
>("elmethis.a2ui.catalog");

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
// SurfaceView — one per surface; owns subscriptions and the event delegator.
// ---------------------------------------------------------------------------

interface SurfaceViewProps {
  surface: NoSerialize<SurfaceModel<ComponentApi>>;
}

const SurfaceView = component$<SurfaceViewProps>((props) => {
  // The catalog is fetched from context rather than props so it never crosses
  // a QRL boundary. Both surface and catalog become `undefined` after a
  // client-side resume; we render `null` until they reappear.
  const catalog = useContext(A2uiCatalogContext);
  const tick = useSignal(0);

  // Surface-model subscriptions. `useTask$` (not `useVisibleTask$`) so the
  // task fires deterministically on the client without depending on visibility
  // heuristics — the default intersection-observer strategy never fires inside
  // hidden subtrees like ElmCollapse, and `useVisibleTask$` also doesn't run
  // in jsdom-based test envs. The `if (!surface) return` guard makes the
  // server-side pass a no-op since the NoSerialize surface is undefined there.
  //
  // We also subscribe to each component's `onUpdated` event. The surface-
  // level `onCreated` / `onDeleted` only cover lifecycle, so an
  // `updateComponents` message that mutates an existing component's
  // properties (the common streaming case) would otherwise never trigger a
  // re-render.
  useTask$(({ track, cleanup }) => {
    const surface = track(() => props.surface);
    if (!surface) return;

    const subs: Array<{ unsubscribe(): void }> = [];
    const bump = () => {
      tick.value++;
    };

    for (const [, model] of surface.componentsModel.entries) {
      subs.push(model.onUpdated.subscribe(bump));
    }

    subs.push(
      surface.componentsModel.onCreated.subscribe((model) => {
        bump();
        subs.push(model.onUpdated.subscribe(bump));
      }),
    );
    subs.push(surface.componentsModel.onDeleted.subscribe(bump));
    // "/" fires for every path because notifySignals walks up to root.
    subs.push(surface.dataModel.subscribe("/", bump));

    cleanup(() => {
      for (const s of subs) s.unsubscribe();
    });
  });

  // Reading tick.value establishes the reactive dep so Qwik re-renders when
  // the NoSerialize surface mutates underneath us.
  const tree =
    tick.value >= 0 && props.surface && catalog
      ? renderSurface(props.surface, catalog)
      : null;

  // Event delegation lives as inline bubble handlers on the surface root.
  // Going through Qwik's QRL system (rather than native addEventListener +
  // useVisibleTask$) keeps the handlers reachable from `userEvent` in tests
  // and avoids tying registration to visibility heuristics.
  return (
    <div
      class={styles.surface}
      style={{ "--elmethis-margin-block-start": "2rem" }}
      onClick$={(e) => {
        const surface = props.surface;
        if (!surface) return;
        const el = (e.target as HTMLElement | null)?.closest?.(
          "[data-a2ui-action]",
        ) as HTMLElement | null;
        if (!el) return;
        const cid = el.dataset.a2uiAction ?? "";
        const model = surface.componentsModel.get(cid);
        const action = (model?.properties as { action?: unknown } | undefined)
          ?.action;
        if (!action) return;
        const ctx = new ComponentContext(surface, cid);
        surface
          .dispatchAction(ctx.dataContext.resolveAction(action as never), cid)
          .catch((err: unknown) => {
            console.error("[ElmA2ui] action dispatch failed:", err);
          });
      }}
      onInput$={(e) => writeBack(e, props.surface)}
      onChange$={(e) => writeBack(e, props.surface)}
    >
      {tree}
    </div>
  );
});

/**
 * Routes an input/change event from a `[data-a2ui-bind]` element into the
 * surface's data model. Pulled out of `SurfaceView` so both `onInput$` and
 * `onChange$` can share it without duplicating the body inside a QRL.
 */
function writeBack(
  e: Event,
  surface: NoSerialize<SurfaceModel<ComponentApi>> | undefined,
): void {
  if (!surface) return;
  const target = e.target as HTMLElement | null;
  const bindEl = target?.closest?.("[data-a2ui-bind]") as HTMLElement | null;
  if (!bindEl) return;
  const raw = bindEl.dataset.a2uiBind ?? "";
  const sep = raw.indexOf(":");
  if (sep <= 0) return;
  const cid = raw.slice(0, sep);
  const propName = raw.slice(sep + 1);
  const model = surface.componentsModel.get(cid);
  if (!model) return;
  const bound = (model.properties as Record<string, unknown>)[propName];
  if (!bound || typeof bound !== "object" || !("path" in bound)) return;
  const path = (bound as { path: string }).path;

  const isMulti = bindEl.dataset.a2uiBindMulti === "true";
  let value: unknown;
  if (isMulti) {
    value = Array.from(
      bindEl.querySelectorAll<HTMLInputElement>(
        "input[type=checkbox]:checked, input[type=radio]:checked",
      ),
    ).map((i) => i.value);
  } else if (target instanceof HTMLInputElement) {
    if (target.type === "checkbox") value = target.checked;
    else if (target.type === "range") value = Number(target.value);
    else value = target.value;
  } else if (target instanceof HTMLSelectElement) {
    value = target.multiple
      ? Array.from(target.selectedOptions).map((o) => o.value)
      : target.value;
  } else if (target instanceof HTMLTextAreaElement) {
    value = target.value;
  } else {
    return;
  }

  new ComponentContext(surface, cid).dataContext.set(path, value);
}

// ---------------------------------------------------------------------------
// ElmA2ui — public component.
// ---------------------------------------------------------------------------

export const ElmA2ui = component$<ElmA2uiProps>((props) => {
  const { class: className, style, url, headers, catalogId, catalog } = props;
  const userCatalog = catalog ?? basicCatalog;
  // Publish the catalog through context so child SurfaceViews can resolve
  // renderers without the catalog ever crossing a QRL serialization point.
  useContextProvider(A2uiCatalogContext, noSerialize(userCatalog));

  const messagesStore = useStore<{ list: object[] }>({
    list: props.messages ? [...props.messages] : [],
  });

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

  // ---- setup processor + surface map (one-shot) ----
  useTask$(({ cleanup }) => {
    const ids = new Set<string>([BASIC_CATALOG_ID]);
    if (catalogId) ids.add(catalogId);
    for (const m of messagesStore.list) {
      if (m && typeof m === "object" && "createSurface" in m) {
        const id = (m as { createSurface?: { catalogId?: string } })
          .createSurface?.catalogId;
        if (typeof id === "string") ids.add(id);
      }
    }

    // TODO: when @a2ui/web_core supports lazy catalog registration, replace
    // this with on-demand creation so streams can introduce new catalog ids
    // mid-flight without crashing.
    const catalogs = Array.from(ids).map(
      (id) =>
        new Catalog(id, BASIC_COMPONENTS as ComponentApi[], BASIC_FUNCTIONS),
    );
    const processor = new MessageProcessor<ComponentApi>(catalogs);
    const surfaceMap = new Map<string, SurfaceModel<ComponentApi>>();
    surfaceMapSig.value = noSerialize(surfaceMap);

    const subCreated = processor.model.onSurfaceCreated.subscribe((surface) => {
      surfaceMap.set(surface.id, surface);
      tick.value++;
    });
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

  // ---- sync the `messages` prop into the internal store ----
  // A2UI is an append-only stream protocol, so we only handle "array grew".
  // Tracking the array reference catches both reassignment and identity-
  // preserving mutation by the parent (Qwik wouldn't re-run us in the latter
  // case anyway, but the length check is cheap insurance).
  useTask$(({ track }) => {
    const arr = track(() => props.messages);
    if (!arr) return;
    const have = messagesStore.list.length;
    if (arr.length > have) {
      for (let i = have; i < arr.length; i++) {
        messagesStore.list.push(arr[i]!);
      }
    } else if (arr.length < have) {
      console.warn(
        "[ElmA2ui] messages prop shrank; A2UI streams are append-only",
      );
    }
  });

  // ---- incremental processing for messages appended after mount ----
  useTask$(({ track }) => {
    track(() => messagesStore.list.length);
    const internal = processorRef.value;
    if (!internal) return;
    const fresh = messagesStore.list.slice(internal.processed);
    if (!fresh.length) return;
    // Process one at a time so a single malformed / stale message (e.g.
    // an update targeting a surface that was never created) doesn't drop
    // every subsequent message in the batch.
    for (const msg of fresh) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        internal.processor.processMessages([msg] as any[]);
      } catch (err) {
        console.warn("[ElmA2ui] skipped invalid A2UI message:", msg, err);
      }
    }
    internal.processed = messagesStore.list.length;
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
            if (m && typeof m === "object")
              messagesStore.list.push(m as object);
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
