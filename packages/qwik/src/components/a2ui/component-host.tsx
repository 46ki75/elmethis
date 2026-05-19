/**
 * Recursive A2UI component host.
 *
 * Mirrors the official React (`DeferredChild`/`ResolvedChild`) and Angular
 * (`ComponentHostComponent`) patterns: one `component$` instance per A2UI
 * component, each subscribing only to events for its own id. The surface and
 * catalog are read from context so the recursive render doesn't have to drill
 * `NoSerialize` props through every level.
 *
 * Reactivity model:
 *   - `componentsModel.onCreated` / `onDeleted` are filtered by id, so a
 *     structural change only re-renders the affected host.
 *   - `model.onUpdated` is re-bound when the underlying model is replaced
 *     (e.g. type change Text→CheckBox), avoiding the leak that bulk
 *     surface-level subscriptions exhibited.
 *   - `dataModel.subscribe("/")` lives on each host so every component
 *     re-renders on any data change. A future iteration could narrow this
 *     to per-path subscriptions via `GenericBinder`, at the cost of
 *     Qwik-side QRL plumbing for setters.
 */
import {
  $,
  component$,
  createContextId,
  type JSX,
  type NoSerialize,
  useContext,
  useContextProvider,
  useSignal,
  useTask$,
} from "@qwik.dev/core";

import {
  ComponentContext,
  type ComponentApi,
  type ComponentModel,
  type SurfaceModel,
} from "@a2ui/web_core/v0_9";

import {
  type CatalogRenderer,
  type ChildRef,
  type RenderArgs,
} from "./catalog/catalog";

/** Conventional id of the entry component on every A2UI v0.9 surface. */
export const ROOT_COMPONENT_ID = "root";

/** The `SurfaceModel` for the subtree below the provider. `NoSerialize` because
 * the model carries runtime-only references. */
export const A2uiSurfaceContext = createContextId<
  NoSerialize<SurfaceModel<ComponentApi>> | undefined
>("elmethis.a2ui.surface");

/** Active catalog. Same `NoSerialize` rationale. */
export const A2uiCatalogContext = createContextId<
  NoSerialize<CatalogRenderer> | undefined
>("elmethis.a2ui.catalog");

/** Ids of all `ComponentHost` ancestors above the current node. Used purely
 * for cycle detection — A2UI catalogs technically allow self-referential
 * children, and infinite recursion would crash the render. */
export const A2uiAncestorContext = createContextId<readonly string[]>(
  "elmethis.a2ui.ancestors",
);

export interface ComponentHostProps {
  /** Component id to look up in the surface's component model. */
  id: string;
  /** Data-context base path for relative bindings inside this subtree. */
  basePath: string;
  /** Sibling index, surfaced to renderers for first-child margin logic. */
  index?: number;
}

export const ComponentHost = component$<ComponentHostProps>((props) => {
  const surface = useContext(A2uiSurfaceContext);
  const catalog = useContext(A2uiCatalogContext);
  const ancestors = useContext(A2uiAncestorContext);
  const isCycle = ancestors.includes(props.id);

  // Extend the ancestor chain for descendants. Safe to do unconditionally —
  // a cycle render returns null below, so no children will ever consume it.
  useContextProvider(A2uiAncestorContext, [...ancestors, props.id]);

  const tick = useSignal(0);
  // Latched once the host has ever resolved a model for `props.id`. Used
  // to distinguish two visually-different cases that both observe a
  // missing model: a genuine out-of-order arrival (never seen → show
  // `[Loading id…]`) vs. a transient gap between `onDeleted` and
  // `onCreated` during a type swap (seen before → render nothing
  // instead of flashing the placeholder).
  const everHadModel = useSignal(false);

  useTask$(({ cleanup }) => {
    // `surface` is a NoSerialize-wrapped value: undefined during SSR /
    // initial resume, populated on the client. The surface check doubles as
    // the SSR-skip — using `isServer` here would incorrectly skip
    // createDOM-based test envs where the model is available but the build
    // flag still reports server.
    if (!surface) return;

    const subs: Array<{ unsubscribe(): void }> = [];
    // Re-bound whenever the underlying model is created/replaced — keeps a
    // single live subscription regardless of how many times the model
    // identity churns (Text → CheckBox → Text → …).
    let updateSub: { unsubscribe(): void } | null = null;

    const subscribeToModel = (model: ComponentModel) => {
      updateSub?.unsubscribe();
      updateSub = model.onUpdated.subscribe(() => {
        tick.value++;
      });
      everHadModel.value = true;
    };

    const initial = surface.componentsModel.get(props.id);
    if (initial) subscribeToModel(initial);

    subs.push(
      surface.componentsModel.onCreated.subscribe((m) => {
        if (m.id !== props.id) return;
        subscribeToModel(m);
        tick.value++;
      }),
    );
    subs.push(
      surface.componentsModel.onDeleted.subscribe((id) => {
        if (id !== props.id) return;
        updateSub?.unsubscribe();
        updateSub = null;
        tick.value++;
      }),
    );
    subs.push(
      surface.dataModel.subscribe("/", () => {
        tick.value++;
      }),
    );

    cleanup(() => {
      for (const s of subs) s.unsubscribe();
      updateSub?.unsubscribe();
    });
  });

  // Establish reactive dependency on tick so the render re-runs when
  // structural / data events bump it.
  void tick.value;

  if (isCycle) return null;
  if (!surface || !catalog) return null;

  const model = surface.componentsModel.get(props.id);
  if (!model) {
    // If we've previously resolved a model for this id, the gap is a
    // swap-in-progress (`onDeleted` has fired, `onCreated` for the
    // replacement hasn't yet). Render nothing rather than flash the
    // placeholder — the next microtask will bring `onCreated`.
    if (everHadModel.value) return null;
    // Out-of-order arrival: a parent referenced this id before its own
    // `updateComponents` message landed. The placeholder mirrors the
    // official React renderer's `[Loading {id}…]` affordance and lets
    // tests assert the loading state without poking at component-model
    // internals.
    return (
      <span
        data-a2ui-state="loading"
        data-a2ui-component-id={props.id}
        style="color:gray;font-size:0.875em;font-style:italic"
      >
        [Loading {props.id}…]
      </span>
    );
  }
  const render = catalog.get(model.type);
  if (!render) {
    // The model exists but the active catalog has no renderer for its
    // type — usually an agent emitting a custom component against the
    // basic catalog. Surface the type so debugging the mismatch is
    // immediate.
    return (
      <span
        data-a2ui-state="unknown"
        data-a2ui-component-id={props.id}
        data-a2ui-component-type={model.type}
        style="color:tomato;font-weight:600"
      >
        Unknown component: {model.type}
      </span>
    );
  }

  const ctx = new ComponentContext(surface, props.id, props.basePath);

  const resolve = <V,>(v: unknown): V => {
    if (typeof v === "string") return v as V;
    if (v == null) return "" as V;
    if (typeof v === "object")
      return (ctx.dataContext.resolveDynamicValue(v as never) ?? "") as V;
    return String(v) as V;
  };

  const childRefs = (value: unknown): ChildRef[] => {
    if (Array.isArray(value))
      return value
        .filter((id): id is string => typeof id === "string")
        .map((id) => ({ id, path: props.basePath }));
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
    path: string = props.basePath,
    childIndex: number = 0,
  ): JSX.Element | null => (
    // `key={childId}` is load-bearing: it forces Qwik to unmount the
    // previous host and mount a fresh one when a parent re-binds a
    // single-child slot (e.g. Card.child changes "a" → "b"). Without
    // it Qwik reconciles by position and reuses the same component$
    // instance with `props.id` swapped, but the host's internal state
    // — most importantly the `everHadModel` latch and the live
    // `updateSub` bound to the previous model — would carry over and
    // suppress the `[Loading b…]` placeholder for the new id.
    // List/Column/Row already key their iteration wrappers; this
    // covers the single-child renderers (Card, Modal slots, Button
    // child, …) and any future custom renderer.
    <ComponentHost
      key={childId}
      id={childId}
      basePath={path}
      index={childIndex}
    />
  );

  // QRL setter — captures only `surface` (NoSerialize, safe across QRL
  // boundaries) and `props.id` (string). Renderers call this from inside
  // their `onInput$` / `onChange$` handlers; the path is looked up from
  // the live component model at call time rather than burned in at render
  // time so a parent-driven `updateComponents` that rebinds a prop is
  // honored without re-mounting the input.
  const idCapture = props.id;
  const setBinding$ = $((propName: string, value: unknown) => {
    if (!surface) return;
    const m = surface.componentsModel.get(idCapture);
    if (!m) return;
    const raw = (m.properties as Record<string, unknown>)[propName];
    if (!raw || typeof raw !== "object" || !("path" in raw)) return;
    const path = (raw as { path: string }).path;
    new ComponentContext(surface, idCapture).dataContext.set(path, value);
  });

  // QRL dispatcher — mirror of `setBinding$` for action props. Defaults to
  // the `"action"` property name but accepts an override for components
  // that bind multiple actions. Walks the action with a recursive
  // resolver so nested `{ path }` / `{ call }` literals inside
  // `event.context` (or anywhere else in the action shape) are evaluated
  // before dispatch — matching the official `GenericBinder.ACTION`. The
  // SDK's `DataContext.resolveAction` only walks the top-level context
  // record, so nested bindings would otherwise reach the action
  // listener as unresolved `{ path }` objects.
  const dispatchAction$ = $((propName: string = "action") => {
    if (!surface) return;
    const m = surface.componentsModel.get(idCapture);
    if (!m) return;
    const action = (m.properties as Record<string, unknown>)[propName];
    if (!action) return;
    const dispatchCtx = new ComponentContext(surface, idCapture);
    const resolveDeep = (val: unknown): unknown => {
      if (val === null || typeof val !== "object") return val;
      if ("path" in val || "call" in val) {
        return dispatchCtx.dataContext.resolveDynamicValue(val as never);
      }
      if (Array.isArray(val)) return val.map(resolveDeep);
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(val)) out[k] = resolveDeep(v);
      return out;
    };
    surface
      .dispatchAction(resolveDeep(action), idCapture)
      .catch((err: unknown) => {
        console.error("[ComponentHost] action dispatch failed:", err);
      });
  });

  const args: RenderArgs = {
    componentId: props.id,
    index: props.index ?? 0,
    props: model.properties,
    surface,
    ctx,
    resolve,
    childRefs,
    renderChild,
    setBinding$,
    dispatchAction$,
  };

  // `display: contents` makes the wrapper invisible to layout while still
  // emitting a real DOM node. The id-stamped wrapper lets tests query for
  // a component by its A2UI id (e.g. `[data-a2ui-component-id="field"]`)
  // without depending on internal renderer attributes.
  return (
    <span data-a2ui-component-id={props.id} style="display: contents">
      {render(args) as JSX.Element}
    </span>
  );
});
