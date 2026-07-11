# A2UI v0.9 — Renderer Architecture Guide

This reference covers how to build an A2UI client/renderer. The architecture
separates a **framework-agnostic** data layer (JSON parsing, state, pointer
resolution) from a **framework-specific** view layer (React nodes, Flutter
widgets, iOS views), so the same core logic can serve many UI frameworks.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [The Five Core Interfaces](#the-five-core-interfaces)
- [Framework-Agnostic Layer (Data)](#framework-agnostic-layer-data)
- [The Catalog & Functions API](#the-catalog--functions-api)
- [Framework-Specific Layer (View)](#framework-specific-layer-view)
- [Lifecycles, Subscriptions, and Memory](#lifecycles-subscriptions-and-memory)
- [The Gallery App (Reference Tooling)](#the-gallery-app-reference-tooling)
- [Step-by-Step Renderer Build Plan](#step-by-step-renderer-build-plan)

## Architecture Overview

Data flow:

1. A2UI messages arrive from the server.
2. The **`MessageProcessor`** parses each into a strongly-typed
   `A2uiMessage` and mutates the **`SurfaceModel`** state.
3. The **`Surface`** view (framework-specific) listens to the model and
   begins rendering — starting at component id `root`.
4. The `Surface` instantiates **`ComponentImplementation`** nodes
   recursively to build the UI tree.

The split:

- **Framework-agnostic** — JSON parsing, schemas, JSON-pointer resolution,
  state stores. Identical across UI frameworks in a given language.
- **Framework-specific** — turning structured state into actual pixels.

### Implementation topologies

| Ecosystem | Approach |
| :--- | :--- |
| Dynamic langs (TS/JS) | Split into a `web_core` package (data + generic binder via reflection) and per-framework renderer packages (React, Angular, Vue, Lit). |
| Static langs (Kotlin / Swift / Dart) | `<lang>_core` provides the data layer + **manually-implemented** binders for the Basic Catalog. Custom components either get codegen-generated binders or use a "binderless" direct-implementation flow. |
| Single-framework langs (Swift + SwiftUI) | Often a single combined library. Keeping a Binder Layer is still recommended so adopters can swap individual component implementations without rewriting subscription/binding boilerplate. |

## The Five Core Interfaces

### `ComponentApi`

Framework-agnostic contract — name + schema only, no rendering.

```typescript
interface ComponentApi {
  readonly name: string;        // e.g. "Button"
  readonly schema: Schema;      // technical definition for validation / capabilities
}
```

### `ComponentImplementation`

Framework-specific rendering logic, extends `ComponentApi`.

Reactive frameworks (Flutter / SwiftUI / React):

```typescript
interface ComponentImplementation extends ComponentApi {
  build(
    ctx: ComponentContext<ComponentImplementation>,
    buildChild: (id: string) => NativeWidget
  ): NativeWidget;
}
```

Stateful/imperative frameworks (Vanilla DOM / Android Views):

```typescript
interface ComponentInstance {
  mount(container: NativeElement): void;
  update(ctx: ComponentContext<ComponentImplementation>): void;
  unmount(): void;
}

interface ComponentImplementation extends ComponentApi {
  createInstance(ctx: ComponentContext<ComponentImplementation>): ComponentInstance;
}
```

### `Surface`

The framework entrypoint widget. Instantiated with a `SurfaceModel`, listens
to lifecycle events, and recursively builds the UI starting at `root`.

### `SurfaceModel` & `ComponentContext`

- **`SurfaceModel`** — long-lived state of one surface: `dataModel`,
  `componentsModel`, `catalog`, `theme`, `sendDataModel`, plus the `onAction`
  event source.
- **`ComponentContext`** — transient object created per render: pairs a
  specific `ComponentModel` configuration with a scoped `DataContext`.

## Framework-Agnostic Layer (Data)

The data layer **does not vary** between UI frameworks. Port it once per
language and reuse.

### Prerequisites

1. **Schema library** that can both express and emit standard JSON Schema
   (Zod in TS, Pydantic in Python; `Codable` structs work as a last resort).
2. **Observable library** providing:
   - Event streams (publish/subscribe for discrete events).
   - Stateful streams / signals (hold a value, notify on change, expose
     `dispose()` for unsubscribe).

### Design principles

- **"Add" pattern** — separate construction from composition. Children are
  built independently, then attached via `parent.addChild(child)`.
- **Standard observer pattern** — every model exposes
  subscribe/unsubscribe; multi-cast; payload-bearing; uniform across the
  model classes.
- **Granular reactivity** — structure changes via `SurfaceComponentsModel`;
  property changes via `ComponentModel.onUpdated`; data changes only notify
  subscribers of the specific path that changed.

### Protocol models

Don't pass raw `Map<String,Any>` into the state. Define strict native types
(data classes, structs, Zod-validated interfaces) mirroring the JSON schemas:

- `A2uiMessage` (union/protocol type) with `CreateSurfaceMessage`,
  `UpdateComponentsMessage`, `UpdateDataModelMessage`, `DeleteSurfaceMessage`.
- `ClientEvent` (union) with `ActionMessage`, `ErrorMessage`.
- Metadata types: `A2uiClientCapabilities`, `InlineCatalog`,
  `FunctionDefinition`, `ClientDataModel`.

Inbound parsing must throw `A2uiValidationError` **before** the message
reaches the state. Outbound stringifying serializes from the strict types
into wire JSON.

### State models

- **`SurfaceGroupModel`** — root container for active surfaces.
  `addSurface`, `deleteSurface`, `getSurface`. Exposes
  `onSurfaceCreated`, `onSurfaceDeleted`, `onAction`.
- **`SurfaceModel`** — one surface. Holds `catalog`, `dataModel`,
  `componentsModel`, `theme`, `sendDataModel`. Has `dispatchAction(payload,
  sourceComponentId)`.
- **`SurfaceComponentsModel`** — flat `Map<id, ComponentModel>`. Notifies
  on `onCreated` / `onDeleted`.
- **`ComponentModel`** — id + type + mutable `properties`; notifies on
  `onUpdated`.

### `DataModel`

```typescript
class DataModel {
  get(path: string): any;                        // JSON Pointer resolution
  set(path: string, value: any): void;           // atomic update
  subscribe<T>(path: string, onChange: (v: T | undefined) => void): Subscription<T>;
  dispose(): void;
}
```

Implementation rules:

1. **JSON Pointer + relative paths** — A2UI extends RFC 6901 to allow paths
   without a leading `/`; those resolve against the current evaluation
   scope.
2. **Auto-vivification** — when `set` at a nested path encounters a missing
   intermediate, create it. If the next segment is numeric (e.g. `0`),
   create an array; otherwise an object.
3. **Bubble + cascade notification** — when a path changes, notify exact
   subscribers, bubble up to all ancestor paths, and cascade down to all
   descendant paths.
4. **Undefined handling** — setting an object key to `undefined` removes
   the key; setting an array index to `undefined` keeps length and empties
   the slot (sparse array).

Type coercion baseline:

| Input | Target | Result |
| :--- | :--- | :--- |
| `"true"` / `"false"` (case-insensitive) | Boolean | true/false; any other string → false |
| Non-zero Number | Boolean | true |
| `0` | Boolean | false |
| Anything | String | locale-neutral string repr |
| `null`/`undefined` | String | `""` |
| `null`/`undefined` | Number | `0` |
| Numeric string | Number | parsed value (or `0`) |

### Context layer

Transient objects created on demand during rendering. Solves scope and
binding resolution.

```typescript
class DataContext {
  constructor(dataModel: DataModel, path: string);
  readonly path: string;
  set(path: string, value: unknown): void;
  resolveDynamicValue<V>(v: DynamicValue): V;
  subscribeDynamicValue<V>(v: DynamicValue, onChange: (v: V | undefined) => void): Subscription<V>;
  nested(relativePath: string): DataContext;
}

class ComponentContext<T extends ComponentApi> {
  constructor(surface: SurfaceModel<T>, componentId: string, basePath?: string);
  readonly componentModel: ComponentModel;
  readonly dataContext: DataContext;
  readonly surfaceComponents: SurfaceComponentsModel;  // escape hatch
  dispatchAction(action: Record<string, any>): Promise<void>;
}
```

The escape hatch (`ctx.surfaceComponents`) lets a layout engine peek at
siblings (e.g. a `Row` checking each child's `weight`). Use sparingly.

### `MessageProcessor`

The "controller." Accepts validated `A2uiMessage`s, mutates models, and
aggregates client state for sync.

```typescript
class MessageProcessor<T extends ComponentApi> {
  readonly model: SurfaceGroupModel<T>;
  constructor(catalogs: Catalog<T>[], actionHandler: ActionListener);
  processMessages(messages: A2uiMessage[]): void;
  addLifecycleListener(l: SurfaceLifecycleListener<T>): () => void;
  getClientCapabilities(options?: CapabilitiesOptions): A2uiClientCapabilities;
  getClientDataModel(): A2uiClientDataModel | undefined;
}
```

Surface/component lifecycle rules the processor must enforce:

- **`createSurface` for an already-active `surfaceId` is an error** — throw
  or report `VALIDATION_FAILED`.
- **`updateComponents` reusing an `id` with a different `type`** — remove
  the old `ComponentModel` and create a fresh one, so framework renderers
  reset internal state.

### Client capabilities / inline catalog generation

`getClientCapabilities()` returns the wire payload. To emit `inlineCatalogs`
the processor converts internal schemas to standard JSON Schema. Common types
(like `DynamicString`) must surface as external `$ref`s. The reference
implementation uses a tagged-description convention:
`REF:common_types.json#/$defs/DynamicString` — the processor strips the tag
and replaces the node with a `$ref` object during emission.

### `sendDataModel` flow

When a surface is created with `sendDataModel: true`:

1. `MessageProcessor` tracks the flag per surface.
2. `getClientDataModel()` iterates active surfaces and returns
   `{ surfaces: { <surfaceId>: <dataModel> } }` for those with the flag.
3. The transport layer calls `getClientDataModel()` **before** sending each
   outbound message.
4. If non-empty, the payload is attached as transport metadata (A2A:
   `a2uiClientDataModel` field).

## The Catalog & Functions API

```typescript
interface FunctionApi {
  readonly name: string;
  readonly returnType: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'any' | 'void';
  readonly schema: Schema;
}

interface FunctionImplementation extends FunctionApi {
  execute(args: Record<string, any>, context: DataContext): unknown | Observable<unknown>;
}

class Catalog<T extends ComponentApi> {
  readonly id: string;
  readonly components: ReadonlyMap<string, T>;
  readonly functions?: ReadonlyMap<string, FunctionImplementation>;
  readonly themeSchema?: Schema;
}
```

Function patterns:

- **Pure logic** (e.g. `add`, `concat`) — synchronous, returns a static
  value.
- **External state** (e.g. `clock()`, `networkStatus()`) — returns a
  long-lived reactive stream that pushes updates independently of data
  changes.
- **Effect functions** (e.g. `openUrl`, `closeModal`) — return `void`;
  triggered by user actions, not interpolation.

Reactive functions MUST use a listening mechanism that supports
unsubscription. To play nicely with capability generation, every function
SHOULD include a schema.

### Composing custom catalogs

Catalogs compose. You can mix Basic Catalog elements with your own:

```python
myCustomCatalog = Catalog(
  id="https://mycompany.com/catalogs/custom_catalog.json",
  functions=basicCatalog.functions,
  components=basicCatalog.components + [MyCompanyLogoComponent()],
  themeSchema=basicCatalog.themeSchema  # inherit theme schema
)
```

## Framework-Specific Layer (View)

Three strategies for connecting a `ComponentImplementation` to the reactive
data model.

### Strategy 1 — Direct / Binderless

The component manually observes streams inside its `build` method, using
the framework's native reactive tools.

```dart
// Flutter binderless example
Widget build(ComponentContext context, ChildBuilderCallback buildChild) {
  return StreamBuilder(
    stream: context.dataContext.observeDynamicValue(
      context.componentModel.properties['label']
    ),
    builder: (_, snap) => ElevatedButton(
      onPressed: () => context.dispatchAction(context.componentModel.properties['action']),
      child: Text(snap.data?.toString() ?? ''),
    ),
  );
}
```

Simple but scatters A2UI subscription code across every component.

### Strategy 2 — Binder Layer

An intermediate abstraction. The Binder reads raw `properties` and emits a
single stream of fully-typed `ResolvedProps`. Views subscribe to that
stream.

```typescript
interface ComponentBinding<ResolvedProps> {
  readonly propsStream: StatefulStream<ResolvedProps>;
  dispose(): void;
}

interface ComponentBinder<ResolvedProps> {
  readonly schema: Schema;
  bind(context: ComponentContext<any>): ComponentBinding<ResolvedProps>;
}
```

### Strategy 3 — Generic Binders (dynamic languages)

With runtime reflection (TS/Zod, Python/Pydantic), you can write **one**
generic factory that inspects a component's schema and auto-creates the
binder — inferring strict prop types.

```typescript
// Inferred prop type from ButtonSchema:
interface ButtonResolvedProps {
  label?: string;
  action: () => void;
  child?: string;
}

const ReactButton = createReactComponent(ButtonBinder, ({ props, buildChild }) => (
  <button onClick={props.action}>
    {props.child ? buildChild(props.child) : props.label}
  </button>
));
```

Type errors (e.g. typoing `props.action` as `props.onClick`) get caught at
compile time.

### Framework adapter sketches

**React** — `useEffect` to call `binder.bind(context)` on mount,
`useState` to track `propsStream`, return cleanup that calls
`binding.dispose()` on unmount.

**Angular** — `resource()` plus `toSignal(binding.propsStream)`; use
`inject(DestroyRef).onDestroy(...)` to dispose.

### Data props vs structural props

- **Data props** (`label`, `value`) — the binder resolves them and emits
  a new props object reference whenever any value changes (so declarative
  frameworks with strict equality detect the change).
- **Structural props** (`child`, `children`) — the binder **does not**
  resolve them into UI trees. It emits child *descriptors*:
  - `ComponentId` → `{ id, basePath }`.
  - `ChildList` with a template → an iterated list of `ChildNode` streams,
    each carrying the right `basePath` (via
    `context.dataContext.nested(/users/0)` and so on).
- The framework adapter recursively calls `buildChild(id, basePath)` for
  each descriptor.

**Critical**: the recursive `buildChild` helper must inherit the **current**
component's data-context path by default, so nested components using
relative paths resolve against the right scope. Forgetting this is the most
common cause of "empty" data in list templates.

## Lifecycles, Subscriptions, and Memory

Ownership contract:

- **Data layer (MessageProcessor) owns `ComponentModel`** — created,
  updated, destroyed in response to incoming messages.
- **Framework adapter owns `ComponentContext` and `ComponentBinding`** —
  creates them on mount, must call `binding.dispose()` on unmount.

Subscription rules:

1. **Lazy subscription** — bind only when the component is actually
   mounted.
2. **Path stability** — when a property changes path,
   **unsubscribe from the old path before subscribing to the new one**.
3. **Cleanup** — when a component leaves the UI (`deleteSurface` or
   parent unmounted), hook the native unmount callback to dispose all
   subscriptions.

### Reactive validation (`Checkable` trait)

For components with `checks` (`TextField`, `Button`, …):

- Subscribe to each `CheckRule.condition`.
- Reactively render the `message` of the first failing check.
- For action sources (`Button`), reactively disable/block the action when
  any check fails.

## The Gallery App (Reference Tooling)

The Gallery App is the recommended integration-test harness. Three-column
layout:

1. **Left** — list of sample stream files.
2. **Center** — surface preview + the raw JSON message list + an "Advance"
   stepper that processes one message at a time (so you can verify
   progressive rendering).
3. **Right** — live data-model view + action log.

Integration tests should at minimum cover: static rendering, layout
integrity, two-way binding (typing into a `TextField` reflects in the data
model viewer), reactive logic (changes in one component update dependents),
and action context scoping (actions emitted from inside list templates
carry correctly resolved paths).

## Step-by-Step Renderer Build Plan

If you're building a new renderer from scratch, the spec recommends this
sequence:

1. **Ingest context** — read
   `specification/v0_9/docs/a2ui_protocol.md`,
   `specification/v0_9/json/common_types.json`,
   `specification/v0_9/json/server_to_client.json`,
   `specification/v0_9/json/catalogs/minimal/minimal_catalog.json`,
   `specification/v0_9/docs/basic_catalog_implementation_guide.md`.
2. **Write a design doc** — pick the schema library, reactive library
   (must support both event streams and stateful signals), component
   architecture, surface architecture, and binding strategy. **Pause for
   approval.**
3. **Core model layer** — implement event streams, signals, strict
   protocol models with JSON validation, `DataModel` (with pointer
   resolution and cascade/bubble), `ComponentModel`,
   `SurfaceComponentsModel`, `SurfaceModel`, `SurfaceGroupModel`,
   `DataContext`, `ComponentContext`, and `MessageProcessor` (plus
   capabilities generation). Unit-test everything.
4. **Framework layer** — define the concrete `ComponentImplementation`
   base, the `Surface` view that recurses through children, and the
   subscription lifecycle.
5. **Minimal catalog support** — target
   `specification/v0_9/json/catalogs/minimal/minimal_catalog.json` first.
   Implement `Text`, `Row`, `Column`, `Button`, `TextField`, and the
   `capitalize` function.
6. **Gallery app** — build the three-column tool against the minimal
   catalog examples. Verify progressive rendering and reactivity. **Pause
   for approval.**
7. **Basic Catalog support** — implement the rest of `basic_catalog.json`
   per `basic-catalog-guide.md`. Remember:
   **string interpolation belongs only inside `formatString`** — do **not**
   apply it to all strings.

Reference TS implementation: `renderers/web_core/`.

---

Source: `submodules/A2UI/specification/v0_9/docs/renderer_guide.md`.
