/**
 * The A2UI rendering catalog. This is the bridge between the framework-agnostic
 * A2UI data layer (`@a2ui/web_core`) and the Qwik view layer: an immutable
 * lookup of component type names → render functions.
 *
 * Catalogs compose with `.extend(...)`. Library consumers typically extend the
 * built-in `basicCatalog` or `blockCatalog` to override individual components
 * while reusing the rest.
 */
import { type JSX } from "@qwik.dev/core";
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
 * instance. The helpers (`resolve`, `children`, `renderChild`, `bindValue`,
 * `bindAction`) are pre-bound to the current component so renderers stay
 * declarative.
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
   * Returns the DOM attributes that wire this element's `change`/`input`
   * event to writing back to the data model. `multi: true` signals
   * multi-select semantics (e.g. checkbox-style ChoicePicker) so the
   * surface-level delegator can collect all checked values instead of one.
   */
  bindValue: (
    propName: string,
    options?: { multi?: boolean },
  ) => Record<string, string>;

  /**
   * Returns the DOM attributes that wire this element's `click` event to
   * dispatching the bound action. The renderer must ensure the element
   * also carries an appropriate `role`/`tabIndex` if it isn't a native
   * interactive element.
   */
  bindAction: () => Record<string, string>;
}

export type RenderFn<TProps = Record<string, unknown>> = (
  args: RenderArgs<TProps>,
) => JSX.Element | null;

// ---- Surface delegation protocol -------------------------------------------
// These data-attribute helpers are the contract between a renderer and the
// SurfaceView event delegator. Catalog authors should use the `bindValue` /
// `bindAction` helpers on `RenderArgs` rather than calling these directly —
// the names are an internal protocol that may change.

/** Reserved on the surface root; never spread into JSX. */
export const A2UI_BIND_ATTR = "data-a2ui-bind";
export const A2UI_BIND_MULTI_ATTR = "data-a2ui-bind-multi";
export const A2UI_ACTION_ATTR = "data-a2ui-action";

/**
 * Builds the attributes that mark this element as a write-back target for
 * `componentId.propName`. `options.multi` toggles multi-select aggregation
 * (the delegator collects every checked input under this element).
 */
export function bindValueAttrs(
  componentId: string,
  propName: string,
  options?: { multi?: boolean },
): Record<string, string> {
  const attrs: Record<string, string> = {
    [A2UI_BIND_ATTR]: `${componentId}:${propName}`,
  };
  if (options?.multi) attrs[A2UI_BIND_MULTI_ATTR] = "true";
  return attrs;
}

/**
 * Builds the attribute that marks this element as the click target for
 * `componentId`'s bound action.
 */
export function bindActionAttrs(componentId: string): Record<string, string> {
  return { [A2UI_ACTION_ATTR]: componentId };
}

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
// (where the schema is known) and at lookup the consumer is the render-tree,
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
