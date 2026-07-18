import type { JSX } from "solid-js";

import {
  Catalog,
  type ComponentApi,
  type ComponentContext,
  type FunctionImplementation,
  type InferredComponentApiSchemaType,
  type ResolveA2uiProps,
  type SurfaceModel,
} from "@a2ui/web_core/v0_9";

export interface ChildRef {
  id: string;
  basePath: string;
}

export interface RenderArgs<TProps = Record<string, unknown>> {
  componentId: string;
  /** Stable DOM-safe identity scoped by surface, component, and data path. */
  instanceId: string;
  index: number;
  props: TProps;
  surface: SurfaceModel<SolidRendererEntry>;
  context: ComponentContext;
  childRefs: (value: unknown) => ChildRef[];
  renderChild: (
    componentId: string,
    basePath?: string,
    index?: number,
  ) => JSX.Element;
}

export type RenderFn<TProps = Record<string, unknown>> = (
  args: RenderArgs<TProps>,
) => JSX.Element;

export type SolidRendererEntry<Api extends ComponentApi = ComponentApi> =
  Api & {
    render: RenderFn<ResolveA2uiProps<InferredComponentApiSchemaType<Api>>>;
  };

export type RendererEntry<Api extends ComponentApi = ComponentApi> =
  SolidRendererEntry<Api>;

export function defineRenderer<Api extends ComponentApi>(
  api: Api,
  render: RenderFn<ResolveA2uiProps<InferredComponentApiSchemaType<Api>>>,
): SolidRendererEntry<Api> {
  return { ...api, render };
}

/**
 * Immutable Solid renderer definitions paired with their A2UI schemas and
 * functions. The same entries are passed to `MessageProcessor` and used for
 * rendering, so validation/binding and view lookup cannot drift apart.
 */
export class CatalogRenderer {
  readonly components: ReadonlyMap<string, SolidRendererEntry>;
  readonly functions: readonly FunctionImplementation[];

  constructor(
    components: Iterable<SolidRendererEntry> = [],
    functions: readonly FunctionImplementation[] = [],
  ) {
    const entries = new Map<string, SolidRendererEntry>();
    for (const component of components) entries.set(component.name, component);
    this.components = entries;
    this.functions = [...functions];
  }

  get(name: string): SolidRendererEntry | undefined {
    return this.components.get(name);
  }

  names(): string[] {
    return [...this.components.keys()];
  }

  extend(
    ...overrides: ReadonlyArray<CatalogRenderer | SolidRendererEntry>
  ): CatalogRenderer {
    const components = new Map(this.components);
    const functions = new Map(
      this.functions.map((implementation) => [
        implementation.name,
        implementation,
      ]),
    );
    for (const override of overrides) {
      if (override instanceof CatalogRenderer) {
        for (const [name, component] of override.components) {
          components.set(name, component);
        }
        for (const implementation of override.functions) {
          functions.set(implementation.name, implementation);
        }
      } else {
        components.set(override.name, override);
      }
    }
    return new CatalogRenderer(components.values(), [...functions.values()]);
  }

  toCatalog(id: string): Catalog<SolidRendererEntry> {
    return new Catalog(id, [...this.components.values()], [...this.functions]);
  }
}
