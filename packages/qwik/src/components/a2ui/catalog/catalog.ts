/**
 * The A2UI rendering catalog. This is the bridge between the framework-agnostic
 * A2UI data layer (`@a2ui/web_core`) and the Qwik view layer: an immutable
 * lookup of component type names → render functions.
 *
 * Catalogs compose with `.extend(...)`. Library consumers typically extend the
 * built-in `basicCatalog` or `blockCatalog` to override individual components
 * while reusing the rest.
 */
import { type JSX, type QRL } from "@qwik.dev/core";
import { type z } from "zod";

import {
  type ComponentApi,
  type ComponentContext,
  type SurfaceModel,
} from "@a2ui/web_core/v0_9";

/**
 * Descriptor for one resolved child of a parent component — either a static
 * child id with the parent's data scope, or one row of an expanded list
 * template with its own scoped data path.
 */
export interface ChildRef {
  id: string;
  path: string;
}

/**
 * Everything a render function needs to produce JSX for a single component
 * instance. The helpers (`resolve`, `childRefs`, `renderChild`,
 * `setBinding$`, `dispatchAction$`) are pre-bound to the current component
 * so renderers stay declarative.
 */
export interface RenderArgs<TProps = Record<string, unknown>> {
  /** Unique component id within the surface. */
  componentId: string;
  /** Zero-based index among siblings (used for first-child margin overrides). */
  index: number;
  /** Typed properties as declared on the component's schema. */
  props: TProps;
  /** The full surface model — escape hatch for advanced lookups. */
  surface: SurfaceModel<ComponentApi>;
  /** A2UI-side context: resolves bindings, dispatches actions, scopes data. */
  ctx: ComponentContext;

  /**
   * Coerces a prop value (literal string, `{ path }`, `{ call }`) into a
   * resolved primitive. Defaults to `string`; pass a generic for other shapes.
   */
  resolve: <V = string>(value: unknown) => V;

  /**
   * Resolves a `children` prop into a flat list of child refs. Handles both
   * static arrays (`["id1", "id2"]`) and list templates
   * (`{ componentId, path }`) — each entry carries its own data-scope
   * `path` so relative bindings resolve to the right row.
   */
  childRefs: (value: unknown) => ChildRef[];

  /** Recursively renders a child by id with optional scope override. */
  renderChild: (
    componentId: string,
    path?: string,
    index?: number,
  ) => JSX.Element | null;

  /**
   * Writes `value` back into the surface's data model for the binding
   * behind `propName`. If the property isn't path-bound, the call is a
   * no-op. This is a `QRL` so renderers can capture it inside `onInput$`
   * / `onChange$` without crossing Qwik's serialization boundary — the
   * surface and component id are baked into the captured QRL by
   * `ComponentHost`.
   */
  setBinding$: QRL<(propName: string, value: unknown) => void>;

  /**
   * Resolves and dispatches the component's bound action. Looks up the
   * named property (default `"action"`) on the live component model, walks
   * any nested path bindings, and calls `surface.dispatchAction`. No-op if
   * the property isn't an action.
   */
  dispatchAction$: QRL<(propName?: string) => void>;
}

export type RenderFn<TProps = Record<string, unknown>> = (
  args: RenderArgs<TProps>,
) => JSX.Element | null;

/** One entry in a `CatalogRenderer`. */
export interface RendererEntry<TProps = Record<string, unknown>> {
  name: string;
  render: RenderFn<TProps>;
}

/**
 * Type-safe factory that derives the props type from a `ComponentApi`'s Zod
 * schema. Use this instead of hand-writing `RendererEntry` literals.
 *
 * @example
 * defineRenderer(TextApi, ({ props, resolve }) => (
 *   <span>{resolve(props.text)}</span>
 * ))
 */
export function defineRenderer<Api extends ComponentApi>(
  api: Api,
  render: RenderFn<z.infer<Api["schema"]>>,
): RendererEntry<z.infer<Api["schema"]>> {
  return {
    name: api.name,
    render: render as RenderFn,
  };
}

/**
 * Immutable map of component-type names → render functions. Compose with
 * `.extend()` to override or add entries; the result is a new instance, so
 * shared catalogs stay safe to pass around.
 */
// Entries are stored with `any`-typed props because the prop schema varies
// per component. Type safety is enforced at the `defineRenderer` call site
// (where the schema is known) and at lookup the consumer is `ComponentHost`,
// which only cares about the `RenderFn` signature.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRendererEntry = RendererEntry<any>;

export class CatalogRenderer {
  private readonly entries: ReadonlyMap<string, AnyRendererEntry>;

  constructor(entries: Iterable<AnyRendererEntry> = []) {
    const map = new Map<string, AnyRendererEntry>();
    for (const entry of entries) map.set(entry.name, entry);
    this.entries = map;
  }

  /** Returns the render function for a component type, or `undefined`. */
  get(name: string): RenderFn | undefined {
    return this.entries.get(name)?.render;
  }

  /** Enumerates registered component-type names. */
  names(): string[] {
    return Array.from(this.entries.keys());
  }

  /**
   * Returns a new catalog with the supplied entries (or other catalogs)
   * merged on top. Later entries win — so `basicCatalog.extend(myOverrides)`
   * keeps the basic catalog intact and overrides only what's in
   * `myOverrides`.
   */
  extend(
    ...overrides: ReadonlyArray<CatalogRenderer | AnyRendererEntry>
  ): CatalogRenderer {
    const merged = new Map(this.entries);
    for (const o of overrides) {
      if (o instanceof CatalogRenderer) {
        for (const [k, v] of o.entries) merged.set(k, v);
      } else {
        merged.set(o.name, o);
      }
    }
    return new CatalogRenderer(merged.values());
  }
}
