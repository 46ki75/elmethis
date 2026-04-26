import {
  component$,
  type NoSerialize,
  useSignal,
  useVisibleTask$,
  type JSX,
} from "@builder.io/qwik";

import {
  ComponentContext,
  type ComponentApi,
  type SurfaceModel,
} from "@a2ui/web_core/v0_9";

import { type CatalogRendererMap } from "./elm-a2ui-catalog-renderer";
import { elmBasicCatalogRendererMap } from "./elm-a2ui-basic-catalog-renderer";
import styles from "./elm-a2ui.module.css";

export type { CatalogRendererMap, RenderContext } from "./elm-a2ui-catalog-renderer";

export interface ElmA2uiSurfaceRendererProps {
  surface: NoSerialize<SurfaceModel<ComponentApi>>;
  /**
   * Optional custom catalog renderer map. Falls back to the built-in basic
   * catalog renderer when not provided.
   */
  catalog?: CatalogRendererMap;
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
      for (const c of p.children)
        if (typeof c === "string") referenced.add(c);
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
  catalog: CatalogRendererMap = elmBasicCatalogRendererMap,
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
    if (
      children &&
      typeof children === "object" &&
      "componentId" in children
    ) {
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
  return renderer
    ? renderer({ componentId, surface, basePath, depth, props, ctx, resolve, childRefs, renderChild })
    : null;
}

/** Renders all components within a single A2UI surface. */
export const ElmA2uiSurfaceRenderer = component$<ElmA2uiSurfaceRendererProps>(
  ({ surface, catalog }) => {
    const containerRef = useSignal<HTMLDivElement | undefined>(undefined);
    const tick = useSignal(0);

    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(({ cleanup }) => {
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
        const bound = model.properties.text;
        if (bound && typeof bound === "object" && "path" in bound) {
          new ComponentContext(surface, cid).dataContext.set(
            bound.path as string,
            el.value,
          );
        }
      };

      const handleChange = (e: Event) => {
        const el = e.target as HTMLInputElement;
        const parts = (el.dataset.a2uiChange ?? "").split(":");
        if (parts.length < 2) return;
        const [cid, prop] = parts;
        const model = surface.componentsModel.get(cid);
        if (!model) return;
        const bound = model.properties[prop];
        if (bound && typeof bound === "object" && "path" in bound) {
          const value =
            el.type === "checkbox" ? el.checked : Number(el.value);
          new ComponentContext(surface, cid).dataContext.set(
            bound.path as string,
            value,
          );
        }
        const action =
          model.properties.onChange ?? model.properties.onChangeEnd;
        if (action) {
          const ctx = new ComponentContext(surface, cid);
          surface
            .dispatchAction(ctx.dataContext.resolveAction(action), cid)
            .catch(console.error);
        }
      };

      if (container) {
        container.addEventListener("click", handleClick);
        container.addEventListener("input", handleInput);
        container.addEventListener("change", handleChange);
      }

      cleanup(() => {
        subCreated.unsubscribe();
        subDeleted.unsubscribe();
        subData.unsubscribe();
        if (container) {
          container.removeEventListener("click", handleClick);
          container.removeEventListener("input", handleInput);
          container.removeEventListener("change", handleChange);
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
  },
);
