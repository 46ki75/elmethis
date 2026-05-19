/**
 * Recursively walks a surface's component tree starting at `"root"` and emits
 * the JSX for each component via its registered renderer in the catalog.
 *
 * Per the A2UI v0.9 spec, the root of a surface lives at component id `"root"`.
 * If the surface doesn't define one, nothing renders.
 *
 * Cycles are tolerated: the same component id encountered along an active
 * render path is skipped (rendered as `null`) so we never recurse forever.
 */
import { type JSX } from "@qwik.dev/core";

import {
  ComponentContext,
  type ComponentApi,
  type SurfaceModel,
} from "@a2ui/web_core/v0_9";

import {
  type CatalogRenderer,
  type ChildRef,
  type RenderArgs,
  bindActionAttrs,
  bindValueAttrs,
} from "./catalog/catalog";

/** Conventional id of the entry component on every A2UI v0.9 surface. */
export const ROOT_COMPONENT_ID = "root";

/** Renders the surface starting from `"root"`. Returns `null` if absent. */
export function renderSurface(
  surface: SurfaceModel<ComponentApi>,
  catalog: CatalogRenderer,
): JSX.Element | null {
  return renderById(ROOT_COMPONENT_ID, surface, catalog, "/", 0, new Set());
}

function renderById(
  componentId: string,
  surface: SurfaceModel<ComponentApi>,
  catalog: CatalogRenderer,
  basePath: string,
  index: number,
  visited: Set<string>,
): JSX.Element | null {
  if (visited.has(componentId)) return null;
  const model = surface.componentsModel.get(componentId);
  if (!model) return null;
  const render = catalog.get(model.type);
  if (!render) return null;

  visited.add(componentId);
  try {
    const ctx = new ComponentContext(surface, componentId, basePath);

    const resolve = <V,>(v: unknown): V => {
      if (typeof v === "string") return v as V;
      if (v == null) return "" as V;
      if (typeof v === "object")
        return ((ctx.dataContext.resolveDynamicValue(v as never) ?? "") as V);
      return String(v) as V;
    };

    const childRefs = (value: unknown): ChildRef[] => {
      if (Array.isArray(value))
        return value
          .filter((id): id is string => typeof id === "string")
          .map((id) => ({ id, path: basePath }));
      if (value && typeof value === "object" && "componentId" in value) {
        const tmpl = value as { componentId: string; path: string };
        const items = surface.dataModel.get(tmpl.path);
        if (!Array.isArray(items)) return [];
        return items.map((_, i) => ({
          id: tmpl.componentId,
          path: `${tmpl.path}/${i}`,
        }));
      }
      return [];
    };

    const renderChild = (
      childId: string,
      path: string = basePath,
      childIndex: number = 0,
    ): JSX.Element | null =>
      renderById(childId, surface, catalog, path, childIndex, visited);

    const args: RenderArgs = {
      componentId,
      index,
      props: model.properties,
      surface,
      ctx,
      resolve,
      childRefs,
      renderChild,
      bindValue: (prop, opts) => bindValueAttrs(componentId, prop, opts),
      bindAction: () => bindActionAttrs(componentId),
    };
    return render(args);
  } finally {
    visited.delete(componentId);
  }
}
