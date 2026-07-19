import {
  createContext,
  createRenderEffect,
  createSignal,
  onCleanup,
  Show,
  useContext,
  type Accessor,
  type JSX,
} from "solid-js";
import { createStore, reconcile } from "solid-js/store";

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
}

interface BoundRenderer {
  entry: SolidRendererEntry;
  context: ComponentContext;
}

const encodeInstanceId = (...parts: string[]): string =>
  `a2ui-${encodeURIComponent(JSON.stringify(parts))}`;

export const ComponentHost = (props: ComponentHostProps) => {
  const surface = useContext(A2uiSurfaceContext);
  const catalog = useContext(A2uiCatalogContext);
  const ancestors = () => props.ancestors ?? [];
  const isCycle = () => ancestors().includes(props.id);
  const [model, setModel] = createSignal<ComponentModel>();
  const [everHadModel, setEverHadModel] = createSignal(false);
  const [bound, setBound] = createSignal<BoundRenderer>();
  const [resolvedProps, setResolvedProps] = createStore<
    Record<string, unknown>
  >({});

  createRenderEffect(() => {
    const id = props.id;
    const currentSurface = surface?.();
    if (isCycle() || currentSurface == null) {
      setModel(undefined);
      return;
    }
    const initial = currentSurface.componentsModel.get(id);
    setModel(initial);
    setEverHadModel(initial != null);
    const created = currentSurface.componentsModel.onCreated.subscribe(
      (next: ComponentModel) => {
        if (next.id !== id) return;
        setEverHadModel(true);
        setModel(next);
      },
    );
    const deleted = currentSurface.componentsModel.onDeleted.subscribe(
      (deletedId: string) => {
        if (deletedId === id) setModel(undefined);
      },
    );
    onCleanup(() => {
      created.unsubscribe();
      deleted.unsubscribe();
    });
  });

  createRenderEffect(() => {
    const current = model();
    const currentSurface = surface?.();
    const entry = current == null ? undefined : catalog?.().get(current.type);
    if (
      current == null ||
      entry == null ||
      currentSurface == null ||
      isCycle()
    ) {
      setBound(undefined);
      setResolvedProps(reconcile({}));
      return;
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
    setResolvedProps(reconcile({ ...binder.snapshot }));
    setBound({ entry, context });
    const subscription = binder.subscribe((next: Record<string, unknown>) => {
      setResolvedProps(reconcile({ ...next }));
    });
    onCleanup(() => {
      subscription.unsubscribe();
      binder.dispose();
    });
  });

  const normalizeChildren = createChildRefs(() => props.basePath);

  const renderChild = (
    id: string,
    basePath = props.basePath,
    index: number | Accessor<number> = 0,
  ): JSX.Element => (
    <ComponentHost
      id={id}
      basePath={basePath}
      index={index}
      ancestors={[...ancestors(), props.id]}
    />
  );

  const instanceId = () => {
    const currentSurface = surface?.();
    if (currentSurface == null) return "a2ui-unresolved";
    return encodeInstanceId(currentSurface.id, props.id, props.basePath);
  };

  return (
    <Show when={surface?.() != null && catalog?.() != null && !isCycle()}>
      <Show
        when={model()}
        keyed
        fallback={
          <Show when={!everHadModel()}>
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
              <span
                data-a2ui-state="unknown"
                data-a2ui-component-id={props.id}
                data-a2ui-component-key={`${props.id}@${props.basePath}`}
                data-a2ui-component-type={current.type}
                class="a2ui-unknown"
              >
                Unknown component: {current.type}
              </span>
            }
          >
            {(_entry: SolidRendererEntry) => (
              <span
                data-a2ui-component-id={props.id}
                data-a2ui-component-key={`${props.id}@${props.basePath}`}
                style={{ display: "contents" }}
              >
                <Show when={bound()} keyed>
                  {(resolved) => {
                    const Renderer = resolved.entry.render;
                    return (
                      <Renderer
                        componentId={props.id}
                        instanceId={instanceId()}
                        index={
                          typeof props.index === "function"
                            ? props.index()
                            : (props.index ?? 0)
                        }
                        props={resolvedProps}
                        surface={surface!()}
                        context={resolved.context}
                        childRefs={normalizeChildren}
                        renderChild={renderChild}
                      />
                    );
                  }}
                </Show>
              </span>
            )}
          </Show>
        )}
      </Show>
    </Show>
  );
};
