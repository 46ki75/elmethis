import {
  component$,
  noSerialize,
  type NoSerialize,
  useSignal,
  type CSSProperties,
  type JSX,
  useTask$,
} from "@builder.io/qwik";

import {
  MessageProcessor,
  Catalog,
  ComponentContext,
  type ComponentApi,
  type SurfaceModel,
} from "@a2ui/web_core/v0_9";
import {
  BASIC_COMPONENTS,
  BASIC_FUNCTIONS,
} from "@a2ui/web_core/v0_9/basic_catalog";

import { type CatalogRendererMap } from "./elm-a2ui-catalog-renderer";
import { elmBasicCatalogRendererMap } from "./elm-a2ui-basic-catalog-renderer";
import styles from "./elm-a2ui.module.css";

export type {
  CatalogRendererMap,
  RenderContext,
} from "./elm-a2ui-catalog-renderer";

export interface ElmA2uiRendererProps<T extends string = string> {
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
  catalog?: CatalogRendererMap<T>;
}

export function findRootId(surface: SurfaceModel<ComponentApi>): string | null {
  const all = new Set<string>();
  const referenced = new Set<string>();
  for (const [id, model] of surface.componentsModel.entries) {
    all.add(id);
    const p = model.properties;
    if (typeof p.child === "string") referenced.add(p.child);
    if (typeof p.trigger === "string") referenced.add(p.trigger);
    if (Array.isArray(p.children))
      for (const c of p.children) if (typeof c === "string") referenced.add(c);
    if (Array.isArray(p.tabs))
      for (const tab of p.tabs as Array<{ child?: string }>)
        if (typeof tab.child === "string") referenced.add(tab.child);
  }
  for (const id of all) if (!referenced.has(id)) return id;
  return null;
}

export function renderTree(
  componentId: string,
  surface: SurfaceModel<ComponentApi>,
  catalog: CatalogRendererMap<string> = elmBasicCatalogRendererMap,
  basePath = "/",
  depth = 0,
): JSX.Element | null {
  if (depth > 50) return null;
  const model = surface.componentsModel.get(componentId);
  if (!model) return null;

  const ctx = new ComponentContext(surface, componentId, basePath);
  const props = model.properties as Record<string, unknown>;

  const resolve = (v: unknown): string => {
    if (typeof v === "string") return v;
    if (v && typeof v === "object")
      return String(ctx.dataContext.resolveDynamicValue(v as never) ?? "");
    return String(v ?? "");
  };

  const childRefs = (children: unknown): { id: string; path: string }[] => {
    if (Array.isArray(children))
      return children
        .filter((id): id is string => typeof id === "string")
        .map((id) => ({ id, path: basePath }));
    if (children && typeof children === "object" && "componentId" in children) {
      const tmpl = children as { componentId: string; path: string };
      const items = surface.dataModel.get(tmpl.path);
      if (!Array.isArray(items)) return [];
      return items.map((_, i) => ({
        id: tmpl.componentId,
        path: `${tmpl.path}/${i}`,
      }));
    }
    return [];
  };

  const renderChild = (cid: string, path = basePath) =>
    renderTree(cid, surface, catalog, path, depth + 1);

  const renderer = catalog[model.type];
  return typeof renderer === "function"
    ? renderer({
        componentId,
        surface,
        basePath,
        depth,
        props,
        ctx,
        resolve,
        childRefs,
        renderChild,
      })
    : null;
}

// Internal component — not part of the public API.
// Handles per-surface subscriptions and DOM event delegation.
interface SurfaceViewProps {
  surface: NoSerialize<SurfaceModel<ComponentApi>>;
  catalog?: CatalogRendererMap<string>;
}

const SurfaceView = component$<SurfaceViewProps>(({ surface, catalog }) => {
  const containerRef = useSignal<HTMLDivElement | undefined>(undefined);
  const tick = useSignal(0);

  useTask$(({ cleanup }) => {
    if (!surface) return;

    const subCreated = surface.componentsModel.onCreated.subscribe(() => {
      tick.value++;
    });
    const subDeleted = surface.componentsModel.onDeleted.subscribe(() => {
      tick.value++;
    });
    // Subscribe to any DataModel change so that components with dynamic
    // bindings (e.g. text: { path: "/form/name" }) re-render when the
    // server pushes an updateDataModel message.
    // Subscribing to "/" fires for every path because notifySignals() always
    // walks up to the root signal when any nested path is updated.
    const subData = surface.dataModel.subscribe("/", () => {
      tick.value++;
    });

    const container = containerRef.value;

    const handleClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest(
        "[data-a2ui-action]",
      ) as HTMLElement | null;
      if (!el) return;
      const cid = el.dataset.a2uiAction ?? "";
      const model = surface.componentsModel.get(cid);
      if (!model?.properties.action) return;
      const ctx = new ComponentContext(surface, cid);
      surface
        .dispatchAction(
          ctx.dataContext.resolveAction(model.properties.action),
          cid,
        )
        .catch(console.error);
    };

    const handleInput = (e: Event) => {
      const el = e.target as HTMLInputElement;
      const cid = el.dataset.a2uiInput ?? "";
      const model = surface.componentsModel.get(cid);
      if (!model) return;
      // TextFieldApi and DateTimeInputApi both use `value` as the bound property.
      const bound = model.properties.value;
      if (bound && typeof bound === "object" && "path" in bound) {
        new ComponentContext(surface, cid).dataContext.set(
          bound.path as string,
          el.value,
        );
      }
    };

    const handleChange = (e: Event) => {
      const el = e.target as HTMLInputElement | HTMLSelectElement;
      const parts = (el.dataset.a2uiChange ?? "").split(":");
      if (parts.length < 2) return;
      const [cid, prop] = parts;
      const model = surface.componentsModel.get(cid);
      if (!model) return;
      const bound = model.properties[prop];
      if (bound && typeof bound === "object" && "path" in bound) {
        let value: unknown;
        if (el instanceof HTMLInputElement && el.type === "checkbox") {
          value = el.checked;
        } else if (el instanceof HTMLSelectElement && el.multiple) {
          value = Array.from(el.selectedOptions).map((o) => o.value);
        } else if (el instanceof HTMLInputElement && el.type === "range") {
          value = Number(el.value);
        } else {
          value = el.value;
        }
        new ComponentContext(surface, cid).dataContext.set(
          bound.path as string,
          value,
        );
      }
    };

    // Handles value updates for ChoicePicker components.
    const handleChoiceChange = (e: Event) => {
      const el = e.target as HTMLInputElement;
      const container = el.closest("[data-a2ui-choice]") as HTMLElement | null;
      if (!container) return;
      const cid = container.dataset.a2uiChoice ?? "";
      const model = surface.componentsModel.get(cid);
      if (!model) return;
      const bound = model.properties.value;
      if (bound && typeof bound === "object" && "path" in bound) {
        const isMultipleSelection =
          model.properties.variant === "multipleSelection";
        let selected: string[];
        if (isMultipleSelection) {
          selected = Array.from(
            container.querySelectorAll<HTMLInputElement>(
              "input[type=checkbox]:checked",
            ),
          ).map((i) => i.value);
        } else {
          selected = el.value ? [el.value] : [];
        }
        new ComponentContext(surface, cid).dataContext.set(
          bound.path as string,
          selected,
        );
      }
    };

    if (container) {
      container.addEventListener("click", handleClick);
      container.addEventListener("input", handleInput);
      container.addEventListener("change", handleChange);
      container.addEventListener("change", handleChoiceChange);
    }

    cleanup(() => {
      subCreated.unsubscribe();
      subDeleted.unsubscribe();
      subData.unsubscribe();
      if (container) {
        container.removeEventListener("click", handleClick);
        container.removeEventListener("input", handleInput);
        container.removeEventListener("change", handleChange);
        container.removeEventListener("change", handleChoiceChange);
      }
    });
  });

  // tick establishes a reactive dependency so Qwik re-renders when
  // componentsModel (NoSerialize) is mutated by subscription callbacks.
  const rootId = tick.value >= 0 && surface ? findRootId(surface) : null;

  return (
    <div ref={containerRef} class={styles.surface}>
      {rootId && surface ? renderTree(rootId, surface, catalog) : null}
    </div>
  );
});

/** Processes A2UI v0.9 messages and renders each surface. */
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

    useTask$(({ cleanup }) => {
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

    useTask$(({ track }) => {
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
        {/* tick establishes a reactive dependency so Qwik re-renders when
            surfaceMapSig (NoSerialize) is mutated by subscription callbacks */}
        {tick.value >= 0 &&
          Array.from(surfaceMapSig.value?.values() ?? []).map((surface) => (
            <SurfaceView
              key={surface.id}
              surface={noSerialize(surface)}
              catalog={catalog}
            />
          ))}
      </div>
    );
  },
);
