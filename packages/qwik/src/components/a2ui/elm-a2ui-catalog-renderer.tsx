import { type JSX } from "@builder.io/qwik";

import {
  type ComponentContext,
  type ComponentApi,
  type SurfaceModel,
} from "@a2ui/web_core/v0_9";

/**
 * All data a catalog render function receives to produce JSX for one component.
 */
export interface RenderContext {
  /** Unique ID of the component being rendered within the surface. */
  componentId: string;
  /** The full surface model, used for cross-component lookups. */
  surface: SurfaceModel<ComponentApi>;
  /**
   * Data path prefix for the current list context (e.g. `"/items/2"`).
   * Root-level components use `"/"`.
   */
  basePath: string;
  /** Current recursion depth; rendering is halted at 50 to prevent infinite loops. */
  depth: number;
  /** Raw property bag from the component model. Values may be static strings or dynamic bindings. */
  props: Record<string, unknown>;
  /** A2UI component context used to resolve data bindings and dispatch actions. */
  ctx: ComponentContext;
  /**
   * Converts a prop value to a plain string.
   * Handles both static strings and dynamic data bindings (`{ path: "..." }`).
   */
  resolve: (v: unknown) => string;
  /**
   * Resolves a `children` prop to a list of `{ id, path }` pairs.
   * Expands list templates when the prop is a `{ componentId, path }` binding.
   */
  childRefs: (children: unknown) => { id: string; path: string }[];
  /** Recursively renders a child component by its ID. */
  renderChild: (componentId: string, path?: string) => JSX.Element | null;
}

/**
 * Maps component type names to their render functions.
 * Pass a custom map to `ElmA2uiSurfaceRenderer` to override or extend the built-in renderers.
 */
export type CatalogRendererMap = Record<
  string,
  (ctx: RenderContext) => JSX.Element | null
>;
