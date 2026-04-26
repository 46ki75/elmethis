import { type JSX } from "@builder.io/qwik";

import {
  type ComponentContext,
  type ComponentApi,
  type SurfaceModel,
} from "@a2ui/web_core/v0_9";

export interface RenderContext {
  componentId: string;
  surface: SurfaceModel<ComponentApi>;
  basePath: string;
  depth: number;
  props: Record<string, unknown>;
  ctx: ComponentContext;
  resolve: (v: unknown) => string;
  childRefs: (children: unknown) => { id: string; path: string }[];
  renderChild: (componentId: string, path?: string) => JSX.Element | null;
}

export type CatalogRendererMap = Record<
  string,
  (ctx: RenderContext) => JSX.Element | null
>;
