/**
 * Shared types for the A2UI catalog renderer system.
 *
 * A2UI is a declarative, agent-driven UI framework where the server/AI agent
 * controls the UI by sending JSON messages. A **surface** is one independent UI
 * context (e.g. a dialog or a page panel); it owns a `DataModel` (JSON state
 * store) and a collection of component instances. A **catalog** is a shared
 * registry of component type definitions that both server and client understand,
 * so the server can say "render a Button with these props" without sending code.
 */
import { type JSX } from "@builder.io/qwik";

import {
  type ComponentContext,
  type ComponentApi,
  type SurfaceModel,
} from "@a2ui/web_core/v0_9";

/**
 * All data a catalog render function receives to produce JSX for one component.
 *
 * Every entry in a `CatalogRendererMap` is called with this context. Use
 * `resolve` for scalar text/url props, `childRefs` + `renderChild` for child
 * trees, and `ctx.dataContext` when you need reactive or non-string values.
 */
export interface RenderContext<
  TProps extends Record<string, unknown> = Record<string, unknown>,
> {
  /** Unique ID of the component instance within the surface. */
  componentId: string;
  /**
   * The root state container for this surface. Holds the `DataModel` (JSON
   * state store), the full `componentsModel` map, and the `onAction` event
   * source. Use it for cross-component lookups or to dispatch actions manually.
   */
  surface: SurfaceModel<ComponentApi>;
  /**
   * Absolute JSON Pointer path scoping this component's data context.
   * Root-level components receive `"/"`. When a list template is expanded (see
   * `childRefs`), each item receives its own path, e.g. `"/items/0"`,
   * `"/items/1"`, so relative bindings like `{ path: "./name" }` resolve to the
   * correct row in the data model.
   */
  basePath: string;
  /**
   * Current recursion depth of the component tree. Rendering stops at 50 to
   * prevent infinite loops caused by circular child references in the model.
   */
  depth: number;
  /**
   * Zero-based sibling index of this component within its parent's children
   * list. Use this to apply first-child overrides, e.g.:
   * `style={index === 0 ? { "--elmethis-margin-block-start": "0" } : undefined}`
   */
  index: number;
  /**
   * Typed property bag from the component model, shaped by the component's
   * schema (e.g. `z.infer<typeof TextApi.schema>`). Each value may be:
   * - A **static literal** (`string`, `number`, `boolean`, `array`)
   * - A **data binding** (`{ path: "..." }`) resolved from the `DataModel`
   * - A **function call** (`{ call: "...", args: {...} }`) evaluated at render time
   *
   * Pass values through `resolve` to normalise them into a plain string, or
   * call `ctx.dataContext.resolveDynamicValue` directly for non-string types.
   */
  props: TProps;
  /**
   * Instance-level A2UI context for this component. Provides:
   * - `dataContext` — resolves data bindings, subscribes to reactive updates,
   *   and sets values back into the `DataModel`.
   * - `componentModel` — the raw model entry (type, properties).
   * - `theme` — the surface's theme configuration.
   */
  ctx: ComponentContext;
  /**
   * Converts a prop value to a plain `string`, handling all DynamicValue shapes:
   * - Static string → returned as-is
   * - Data binding `{ path: "..." }` → resolved from `DataModel` via `ctx.dataContext`
   * - Anything else → coerced with `String()`
   *
   * @example
   * // props.text may be "Hello" or { path: "/user/name" } — both work:
   * const label = resolve(props.text);
   */
  resolve: (v: unknown) => string;
  /**
   * Resolves a `children` prop into a flat list of `{ id, path }` pairs ready
   * for rendering. Handles two shapes:
   * - **Static array** `["id1", "id2"]` — returns each ID with the current `basePath`.
   * - **List template** `{ componentId: "item", path: "/items" }` — fetches the
   *   array at `path` from the `DataModel` and returns one entry per element,
   *   each with its own scoped path (e.g. `"/items/0"`, `"/items/1"`), so the
   *   single template component is repeated with the correct data context.
   *
   * @example
   * childRefs(props.children).map(({ id, path }, i) => (
   *   <span key={`${id}:${i}`}>{renderChild(id, path)}</span>
   * ))
   */
  childRefs: (children: unknown) => { id: string; path: string }[];
  /**
   * Recursively renders a child component by its ID, passing along the surface,
   * catalog, and an incremented depth counter. Returns `null` if the component
   * ID is not found in the model or the depth limit is reached.
   *
   * Pass the sibling index as the third argument so the child receives the
   * correct `index` in its `RenderContext` (used for first-child style overrides).
   */
  renderChild: (componentId: string, path?: string, index?: number) => JSX.Element | null;
}

/**
 * Maps component type names to their render functions.
 *
 * The renderer map is the bridge between the A2UI model and the framework's
 * JSX. Pass a custom map to `ElmA2uiSurfaceRenderer` via the `catalog` prop to
 * override built-in renderers or add new component types not covered by
 * `elmBasicCatalogRendererMap`.
 *
 * @example
 * const myMap: CatalogRendererMap = {
 *   ...elmBasicCatalogRendererMap,
 *   CustomBanner: ({ props, resolve }) => <Banner text={resolve(props.text)} />,
 * };
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RendererFn = (ctx: RenderContext<any>) => JSX.Element | null;

// When T = string (the default / widened case), produce an index-signature type that
// also allows `boolean` values so that noSerialize's `__no_serialize__: true` property
// doesn't conflict. For specific string unions (e.g. "Text" | "Row"), produce a
// plain mapped type with no index signature.
export type CatalogRendererMap<T extends string = string> = string extends T
  ? { [key: string]: RendererFn | boolean }
  : { [K in T]: RendererFn };
