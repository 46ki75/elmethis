import {
  createContext,
  createEffect,
  createMemo,
  createSignal,
  createStore,
  onCleanup,
  reconcile,
  Show,
  useContext,
  type Accessor,
} from "solid-js";
import type { JSX } from "@solidjs/web";

import {
  ComponentContext,
  GenericBinder,
  type ComponentModel,
  type SurfaceModel,
} from "@a2ui/web_core/v0_9";

import {
  type CatalogRenderer,
  type SolidRendererEntry,
  createChildRefs,
} from "./catalog/catalog";

export const ROOT_COMPONENT_ID = "root";

export const A2uiSurfaceContext =
  createContext<Accessor<SurfaceModel<SolidRendererEntry>>>();
export const A2uiCatalogContext = createContext<Accessor<CatalogRenderer>>();

export interface ComponentHostProps {
  id: string;
  basePath: string;
  index?: number | Accessor<number>;
  ancestors?: readonly string[];
  wrap?: boolean;
}

const encodeInstanceId = (...parts: string[]): string =>
  `a2ui-${encodeURIComponent(JSON.stringify(parts))}`;

export const ComponentHost = (props: ComponentHostProps) => {
  const surface = useContext(A2uiSurfaceContext);
  const catalog = useContext(A2uiCatalogContext);
  const ancestors = () => props.ancestors ?? [];
  const isCycle = () => ancestors().includes(props.id);
  const source = createMemo(() => ({
    id: props.id,
    components: isCycle() ? undefined : surface?.().componentsModel,
  }));
  // The initial snapshot is needed synchronously; subsequent updates are SDK events.
  const [component, setComponent] = createSignal<{
    model: ComponentModel | undefined;
    everHadModel: boolean;
  }>(() => {
    const { id, components } = source();
    const model = components?.get(id);
    return { model, everHadModel: model != null };
  });
  const model = () => component().model;

  createEffect(source, ({ id, components }) => {
    if (!components) {
      return undefined;
    }
    const created = components.onCreated.subscribe((next) => {
      if (next.id === id) {
        setComponent({ model: next, everHadModel: true });
      }
    });
    const deleted = components.onDeleted.subscribe((deletedId) => {
      if (deletedId === id) {
        setComponent((previous) => ({ ...previous, model: undefined }));
      }
    });
    // Catch changes between the render snapshot and subscribing to SDK events.
    const current = components.get(id);
    setComponent((previous) =>
      previous.model === current
        ? previous
        : {
            model: current,
            everHadModel: previous.everHadModel || current != null,
          },
    );
    return () => {
      created.unsubscribe();
      deleted.unsubscribe();
    };
  });

  const bound = createMemo(() => {
    const current = model();
    const currentSurface = surface?.();
    const entry = current && catalog?.().get(current.type);
    if (!entry || !currentSurface || isCycle()) {
      return undefined;
    }
    const context = new ComponentContext(
      currentSurface,
      props.id,
      props.basePath,
    );
    const binder = new GenericBinder<Record<string, unknown>>(
      context,
      entry.schema,
    );
    onCleanup(() => binder.dispose());
    return { entry, context, binder, surface: currentSurface };
  });
  const [resolvedProps, setResolvedProps] = createStore<
    Record<string, unknown>
  >(() => ({ ...bound()?.binder.snapshot }), {});
  createEffect(bound, (resolved) => {
    if (!resolved) {
      return undefined;
    }
    const updateProps = (next: Record<string, unknown>) => {
      setResolvedProps((draft) => {
        reconcile({ ...next })(draft);
      });
    };
    updateProps(resolved.binder.snapshot);
    const subscription = resolved.binder.subscribe(updateProps);
    return () => subscription.unsubscribe();
  });

  const normalizeChildren = createChildRefs(() => props.basePath);

  const renderChild = (
    id: string,
    basePath = props.basePath,
    index: number | Accessor<number> = 0,
    wrap = true,
  ): JSX.Element => (
    <ComponentHost
      id={id}
      basePath={basePath}
      index={index}
      ancestors={[...ancestors(), props.id]}
      wrap={wrap}
    />
  );

  const instanceId = () => {
    const currentSurface = surface?.();
    if (currentSurface == null) {
      return "a2ui-unresolved";
    }
    return encodeInstanceId(currentSurface.id, props.id, props.basePath);
  };

  const BoundComponent = () => (
    <Show when={bound()} keyed>
      {(resolved) => {
        const Renderer = resolved.entry.render;
        return (
          <Renderer
            componentId={props.id}
            componentKey={`${props.id}@${props.basePath}`}
            instanceId={instanceId()}
            index={
              typeof props.index === "function"
                ? props.index()
                : (props.index ?? 0)
            }
            props={resolvedProps}
            surface={resolved.surface}
            context={resolved.context}
            childRefs={normalizeChildren}
            renderChild={renderChild}
          />
        );
      }}
    </Show>
  );

  return (
    <Show when={surface?.() != null && catalog?.() != null && !isCycle()}>
      <Show
        when={model()}
        keyed
        fallback={
          <Show when={!component().everHadModel && props.wrap !== false}>
            <span
              data-a2ui-state="loading"
              data-a2ui-component-id={props.id}
              data-a2ui-component-key={`${props.id}@${props.basePath}`}
              class="a2ui-loading"
            >
              [Loading {props.id}…]
            </span>
          </Show>
        }
      >
        {(current) => (
          <Show
            when={catalog?.().get(current.type)}
            keyed
            fallback={
              <Show when={props.wrap !== false}>
                <span
                  data-a2ui-state="unknown"
                  data-a2ui-component-id={props.id}
                  data-a2ui-component-key={`${props.id}@${props.basePath}`}
                  data-a2ui-component-type={current.type}
                  class="a2ui-unknown"
                >
                  Unknown component: {current.type}
                </span>
              </Show>
            }
          >
            {(_entry: SolidRendererEntry) => (
              <Show when={props.wrap !== false} fallback={<BoundComponent />}>
                <span
                  data-a2ui-component-id={props.id}
                  data-a2ui-component-key={`${props.id}@${props.basePath}`}
                  style={{ display: "contents" }}
                >
                  <BoundComponent />
                </span>
              </Show>
            )}
          </Show>
        )}
      </Show>
    </Show>
  );
};
