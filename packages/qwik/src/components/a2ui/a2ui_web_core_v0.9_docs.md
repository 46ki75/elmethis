# A2UI Web-Core — Public API Reference (v0.9)

> **Import rule:** always import from the package entry point, never from internal sub-paths.
>
> ```ts
> import { MessageProcessor, Catalog, DataContext, … } from '@a2ui/web-core';
> // or, during development, from the source entry point:
> import { … } from './renderers/web_core/src/v0_9/index.js';
> ```

---

## Table of Contents

1. [Catalog](#1-catalog)
   - [Catalog (class)](#catalog-class)
   - [createFunctionImplementation](#createfunctionimplementation)
   - [isSignal](#issignal)
   - [Types: FunctionInvoker · FunctionApi · FunctionImplementation · ComponentApi · A2uiReturnType · InferA2uiReturnType · InferredComponentApiSchemaType](#catalog-types)
2. [Message Processing](#2-message-processing)
   - [MessageProcessor (class)](#messageprocessor-class)
   - [Types: CapabilitiesOptions](#message-processing-types)
3. [Rendering](#3-rendering)
   - [ComponentContext (class)](#componentcontext-class)
   - [DataContext (class)](#datacontext-class)
   - [GenericBinder (class)](#genericbinder-class)
   - [scrapeSchemaBehavior](#scrapeschemabehavior)
   - [Types: BehaviorNode · ResolveA2uiProp · GenerateSetters · ResolveA2uiProps](#rendering-types)
4. [Reactivity](#4-reactivity)
   - [Preact Signals re-exports: signal · computed · effect · Signal](#preact-signals-re-exports)
   - [Framework-agnostic interfaces: SignalKinds · WritableSignalKinds · FrameworkSignal](#framework-agnostic-signal-interfaces)
5. [State Models](#5-state-models)
   - [SurfaceGroupModel (class)](#surfacegroupmodel-class)
   - [SurfaceModel (class)](#surfacemodel-class)
   - [SurfaceComponentsModel (class)](#surfacecomponentsmodel-class)
   - [ComponentModel (class)](#componentmodel-class)
   - [DataModel (class)](#datamodel-class)
   - [Types: ActionListener · DataSubscription](#state-model-types)
6. [Events / Subscriptions](#6-events--subscriptions)
   - [EventEmitter (class)](#eventemitter-class)
   - [Types: EventSource · EventListener · Subscription](#event-types)
7. [Schema — Common Types](#7-schema--common-types)
   - [Zod schemas](#common-type-zod-schemas)
   - [TypeScript types](#common-type-typescript-types)
   - [CommonSchemas namespace](#commonschemas-namespace)
8. [Schema — Server-to-Client Messages](#8-schema--server-to-client-messages)
9. [Schema — Client Capabilities](#9-schema--client-capabilities)
10. [Schema — Client-to-Server Messages](#10-schema--client-to-server-messages)
11. [Errors](#11-errors)
12. [Raw JSON Schemas](#12-raw-json-schemas)

---

## 1. Catalog

The catalog is the registry of available UI components and client-side functions that a surface can use.

---

### `Catalog` (class)

```ts
class Catalog<T extends ComponentApi>
```

A collection of available components and functions. Pass one or more `Catalog` instances to `MessageProcessor`.

#### Constructor

```ts
new Catalog(
  id: string,
  components: T[],
  functions?: FunctionImplementation[],
  themeSchema?: z.ZodObject<any>
)
```

| Parameter     | Description                                                                                                    |
| ------------- | -------------------------------------------------------------------------------------------------------------- |
| `id`          | A unique string that identifies this catalog (e.g. `'basic'`). Matched against `catalogId` in server messages. |
| `components`  | Array of objects that implement `ComponentApi`.                                                                |
| `functions`   | Optional array of objects that implement `FunctionImplementation`.                                             |
| `themeSchema` | Optional Zod object schema describing allowed theme parameters.                                                |

#### Properties

| Property      | Type                                          | Description                                                                                                |
| ------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `id`          | `string`                                      | The catalog identifier.                                                                                    |
| `components`  | `ReadonlyMap<string, T>`                      | Registered components, keyed by name.                                                                      |
| `functions`   | `ReadonlyMap<string, FunctionImplementation>` | Registered functions, keyed by name.                                                                       |
| `themeSchema` | `z.ZodObject<any> \| undefined`               | Optional theme parameter schema.                                                                           |
| `invoker`     | `FunctionInvoker`                             | Ready-to-use callback that looks up and calls a function by name. Can be passed directly to `DataContext`. |

#### Example

```ts
import { Catalog, createFunctionImplementation } from "@a2ui/web-core";
import { z } from "zod";

const buttonApi = {
  name: "Button",
  schema: z.object({ label: z.string(), onPress: ActionSchema }),
};

const greetFn = createFunctionImplementation(
  {
    name: "greet",
    returnType: "string",
    schema: z.object({ name: z.string() }),
  },
  ({ name }) => `Hello, ${name}!`,
);

const catalog = new Catalog("my-catalog", [buttonApi], [greetFn]);
```

---

### `createFunctionImplementation`

```ts
function createFunctionImplementation<
  Schema extends z.ZodTypeAny,
  TReturn extends A2uiReturnType,
>(
  api: { name: string; returnType: TReturn; schema: Schema },
  execute: (
    args: z.infer<Schema>,
    context: DataContext,
    abortSignal?: AbortSignal,
  ) => InferA2uiReturnType<TReturn> | Signal<InferA2uiReturnType<TReturn>>,
): FunctionImplementation;
```

Type-safe factory for creating a `FunctionImplementation` from an API descriptor and an execute callback. The schema is used to validate and coerce incoming arguments at runtime.

---

### `isSignal`

```ts
function isSignal(val: any): val is Signal<any>;
```

Returns `true` when `val` is a Preact `Signal` (duck-typed check that works safely across package boundaries and module graphs).

---

### Catalog Types

| Name                                  | Kind        | Description                                                                                          |
| ------------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------- |
| `FunctionInvoker`                     | `type`      | `(name, args, context, abortSignal?) => any` — callback signature used to invoke a catalog function. |
| `A2uiReturnType`                      | `type`      | String literal union: `'string' \| 'number' \| 'boolean' \| 'array' \| 'object' \| 'any' \| 'void'`. |
| `InferA2uiReturnType<T>`              | `type`      | Maps an `A2uiReturnType` string literal to its TypeScript equivalent.                                |
| `FunctionApi`                         | `interface` | Base API descriptor: `{ name, returnType, schema }`.                                                 |
| `FunctionImplementation`              | `interface` | Extends `FunctionApi` with `execute(args, context, abortSignal?)`.                                   |
| `ComponentApi<Schema>`                | `interface` | Component API descriptor: `{ name, schema }`.                                                        |
| `InferredComponentApiSchemaType<Api>` | `type`      | Infers the Zod schema type from a `ComponentApi`. Equivalent to `z.infer<Api['schema']>`.            |

---

## 2. Message Processing

---

### `MessageProcessor` (class)

```ts
class MessageProcessor<T extends ComponentApi>
```

The central entry point for driving the A2UI state machine. Receives server-to-client messages, updates the surface group, and exposes helpers for generating client-side metadata.

#### Constructor

```ts
new MessageProcessor(
  catalogs: Catalog<T>[],
  actionHandler?: ActionListener,
)
```

| Parameter       | Description                                                                                                            |
| --------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `catalogs`      | All catalogs that should be available to surfaces created by this processor.                                           |
| `actionHandler` | Optional callback invoked whenever any surface dispatches an action. Receives the validated `A2uiClientAction` object. |

#### Properties

| Property | Type                   | Description                                     |
| -------- | ---------------------- | ----------------------------------------------- |
| `model`  | `SurfaceGroupModel<T>` | The root state model managed by this processor. |

#### Methods

| Signature                                                                      | Description                                                                                                                                     |
| ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `processMessages(messages: A2uiMessage[] \| A2uiMessageListWrapper): void`     | Applies a batch of server-to-client messages to the state. Handles `createSurface`, `updateComponents`, `updateDataModel`, and `deleteSurface`. |
| `getClientCapabilities(options?: CapabilitiesOptions): A2uiClientCapabilities` | Generates the `a2uiClientCapabilities` object to send to the server (e.g. in the connection handshake).                                         |
| `getClientDataModel(): A2uiClientDataModel \| undefined`                       | Returns the aggregated data model for all surfaces that have `sendDataModel` enabled. Returns `undefined` if none do.                           |
| `onSurfaceCreated(handler): Subscription`                                      | Subscribes to surface creation events.                                                                                                          |
| `onSurfaceDeleted(handler): Subscription`                                      | Subscribes to surface deletion events.                                                                                                          |
| `resolvePath(path, contextPath?): string`                                      | Resolves a relative JSON Pointer path against an optional base path.                                                                            |

#### Example

```ts
import { MessageProcessor, Catalog } from "@a2ui/web-core";

const processor = new MessageProcessor([catalog], (action) => {
  console.log("Action received:", action);
});

// Called whenever your transport layer delivers messages
processor.processMessages(serverMessages);

// Send capabilities to the server
const caps = processor.getClientCapabilities({ includeInlineCatalogs: true });
```

---

### Message Processing Types

| Name                  | Kind        | Description                                                                                                                 |
| --------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------- |
| `CapabilitiesOptions` | `interface` | `{ includeInlineCatalogs?: boolean }` — controls whether full catalog definitions are embedded in the capabilities payload. |

---

## 3. Rendering

---

### `ComponentContext` (class)

```ts
class ComponentContext
```

The per-component rendering context. Bundles together the component's state model, its scoped data context, the surface's component collection, and the theme.

#### Constructor

```ts
new ComponentContext(
  surface: SurfaceModel<any>,
  componentId: string,
  dataModelBasePath?: string  // default: '/'
)
```

Throws `A2uiStateError` if `componentId` is not found in the surface.

#### Properties

| Property            | Type                     | Description                                                |
| ------------------- | ------------------------ | ---------------------------------------------------------- |
| `componentModel`    | `ComponentModel`         | The state model for this component (properties, type, id). |
| `dataContext`       | `DataContext`            | Data context scoped to `dataModelBasePath`.                |
| `surfaceComponents` | `SurfaceComponentsModel` | All component models for the current surface.              |
| `theme`             | `any`                    | Theme object from the surface.                             |

#### Methods

| Signature                               | Description                                               |
| --------------------------------------- | --------------------------------------------------------- |
| `dispatchAction(action): Promise<void>` | Dispatches an action payload on behalf of this component. |

---

### `DataContext` (class)

```ts
class DataContext
```

The unified interface for resolving `DynamicValue` expressions (literals, JSON Pointer paths, function calls) within a specific data scope.

#### Constructor

```ts
new DataContext(surface: SurfaceModel<any>, path: string)
```

#### Properties

| Property          | Type                | Description                               |
| ----------------- | ------------------- | ----------------------------------------- |
| `surface`         | `SurfaceModel<any>` | The owning surface.                       |
| `path`            | `string`            | The absolute base path (current scope).   |
| `dataModel`       | `DataModel`         | The underlying data store.                |
| `functionInvoker` | `FunctionInvoker`   | Callback used to execute named functions. |

#### Methods

| Signature                                                        | Description                                                                                                                                                              |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `set(path, value): void`                                         | Writes a value into the data model. Relative paths are resolved against `this.path`.                                                                                     |
| `resolveDynamicValue<V>(value): V`                               | One-shot synchronous evaluation of a `DynamicValue`. Does **not** set up reactive subscriptions.                                                                         |
| `subscribeDynamicValue<V>(value, onChange): DataSubscription<V>` | Reactively evaluates a `DynamicValue` and calls `onChange` whenever its result changes. Returns a `DataSubscription` with the initial value and an `unsubscribe` method. |
| `resolveSignal<V>(value): Signal<V>`                             | Returns a Preact `Signal` that tracks a `DynamicValue` reactively.                                                                                                       |
| `resolveAction(action): any`                                     | Evaluates the top-level dynamic values inside an `Action` object and returns the resolved payload.                                                                       |
| `nested(relativePath): DataContext`                              | Creates a child `DataContext` scoped to `relativePath` relative to `this.path`. Useful for list items and card sub-trees.                                                |

---

### `GenericBinder` (class)

```ts
class GenericBinder<T>
```

A framework-agnostic reactive engine that transforms raw A2UI JSON component properties into fully resolved, subscription-managed `ResolvedProps`. Framework adapters (React, Angular, etc.) subscribe to the binder rather than implementing binding logic themselves.

#### Constructor

```ts
new GenericBinder(context: ComponentContext, schema: z.ZodTypeAny)
```

Immediately resolves an initial snapshot of props synchronously.

#### Properties / Methods

| Name                                                               | Description                                                                                                                                                |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `currentProps: Partial<T>`                                         | Latest resolved props snapshot.                                                                                                                            |
| `snapshot: T`                                                      | Same as `currentProps`, cast to `T`.                                                                                                                       |
| `subscribe(listener: (props: T) => void): { unsubscribe(): void }` | Registers a callback for future prop changes. Starts the reactive connection on the first subscriber. Auto-disposes when the last subscriber unsubscribes. |
| `dispose(): void`                                                  | Tears down all reactive subscriptions. Called automatically when the last subscriber unsubscribes.                                                         |

#### How the binder resolves properties

The binder uses `scrapeSchemaBehavior` to analyse the Zod schema and categorise each property:

| Behavior           | Input type                          | Resolved output                                                             |
| ------------------ | ----------------------------------- | --------------------------------------------------------------------------- |
| `DYNAMIC`          | `DynamicString`, `DynamicNumber`, … | Primitive value, reactively subscribed                                      |
| `ACTION`           | `Action`                            | `() => void` closure that dispatches the action                             |
| `STRUCTURAL`       | `ChildList`                         | `Array<{ id: string; basePath: string }>`                                   |
| `CHECKABLE`        | `checks` array                      | Injects `isValid: boolean` and `validationErrors: string[]` into the parent |
| `STATIC`           | Any primitive                       | Value passed through unchanged                                              |
| `OBJECT` / `ARRAY` | Nested objects/arrays               | Recursively resolved                                                        |

For every `DYNAMIC` property named `foo`, the binder also generates a `setFoo(value)` setter that writes back to the bound data path.

#### Example (React-like pseudo-code)

```ts
const binder = new GenericBinder<ButtonProps>(
  componentContext,
  ButtonApi.schema,
);

// Subscribe for updates
const sub = binder.subscribe((props) => render(props));

// On unmount
sub.unsubscribe();
```

---

### `scrapeSchemaBehavior`

```ts
function scrapeSchemaBehavior(schema: z.ZodTypeAny): BehaviorNode;
```

Traverses a Zod schema tree and returns a `BehaviorNode` describing how each leaf property should be handled by the `GenericBinder`.

---

### Rendering Types

| Name                  | Kind   | Description                                                                                                                                                           |
| --------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `BehaviorNode`        | `type` | Discriminated union: `{ type: 'DYNAMIC' \| 'ACTION' \| 'STRUCTURAL' \| 'CHECKABLE' \| 'STATIC' }`, plus `{ type: 'OBJECT'; shape }` and `{ type: 'ARRAY'; element }`. |
| `ResolveA2uiProp<T>`  | `type` | Maps a single Zod inferred type to its resolved runtime type (e.g. `Action` → `() => void`).                                                                          |
| `GenerateSetters<T>`  | `type` | For each `DYNAMIC` property `foo` in `T`, generates `setFoo(value): void`.                                                                                            |
| `ResolveA2uiProps<T>` | `type` | Full resolved props type: all properties mapped via `ResolveA2uiProp`, plus all setters from `GenerateSetters`, plus optional `isValid` and `validationErrors`.       |

---

## 4. Reactivity

---

### Preact Signals re-exports

The following are re-exported from `@preact/signals-core` so that consumers do not need a separate direct dependency:

| Name               | Kind       | Description                                                                                                    |
| ------------------ | ---------- | -------------------------------------------------------------------------------------------------------------- |
| `Signal`           | `class`    | A reactive container. Access `.value` inside an `effect` or `computed` to create a subscription.               |
| `signal<T>(value)` | `function` | Creates a writable `Signal`.                                                                                   |
| `computed<T>(fn)`  | `function` | Creates a read-only derived `Signal`.                                                                          |
| `effect(fn)`       | `function` | Runs `fn` immediately and re-runs it whenever any accessed `Signal` value changes. Returns a dispose function. |

---

### Framework-agnostic Signal interfaces

These interfaces allow downstream libraries to declare their own signal implementations in a type-safe way using TypeScript declaration merging.

#### `SignalKinds<T>`

```ts
interface SignalKinds<T> {}
```

An open interface. Augment it to register a read-only signal type for a key:

```ts
declare module "@a2ui/web-core" {
  interface SignalKinds<T> {
    preact: Signal<T>;
  }
}
```

#### `WritableSignalKinds<T>`

```ts
interface WritableSignalKinds<T> {}
```

Like `SignalKinds` but for writable signals.

#### `FrameworkSignal<K>`

```ts
interface FrameworkSignal<K extends keyof SignalKinds<any>>
```

A generic adapter that wraps a framework's signal primitives. Implement this interface to integrate a custom signal library:

| Method     | Signature                                              | Description                                 |
| ---------- | ------------------------------------------------------ | ------------------------------------------- |
| `computed` | `<T>(fn: () => T) => SignalKinds<T>[K]`                | Creates a derived (computed) signal.        |
| `effect`   | `(fn: () => void, cleanup?: () => void) => () => void` | Runs a reactive side-effect.                |
| `isSignal` | `(val: unknown) => val is SignalKinds<any>[K]`         | Type guard for the framework's signal type. |
| `wrap`     | `<T>(val: T) => WritableSignalKinds<T>[K]`             | Wraps a plain value in a signal.            |
| `unwrap`   | `<T>(val: SignalKinds<T>[K]) => T`                     | Extracts the current value from a signal.   |
| `set`      | `<T>(signal, value: T) => void`                        | Writes a new value into a writable signal.  |

---

## 5. State Models

The state models form the in-memory representation of the running A2UI UI. They are updated by `MessageProcessor` and read by renderer adapters.

---

### `SurfaceGroupModel` (class)

```ts
class SurfaceGroupModel<T extends ComponentApi>
```

Root model that owns the set of active surfaces. Normally accessed via `MessageProcessor.model`.

#### Properties

| Property           | Type                                   | Description                                                |
| ------------------ | -------------------------------------- | ---------------------------------------------------------- |
| `onSurfaceCreated` | `EventSource<SurfaceModel<T>>`         | Fires when a new surface is added.                         |
| `onSurfaceDeleted` | `EventSource<string>`                  | Fires when a surface is removed (provides the surface ID). |
| `onAction`         | `EventSource<A2uiClientAction>`        | Aggregated action stream from all surfaces in the group.   |
| `surfacesMap`      | `ReadonlyMap<string, SurfaceModel<T>>` | All currently active surfaces.                             |

#### Methods

| Signature                                      | Description                                      |
| ---------------------------------------------- | ------------------------------------------------ |
| `addSurface(surface): void`                    | Adds a surface. Ignores duplicates.              |
| `deleteSurface(id): void`                      | Removes and disposes a surface by ID.            |
| `getSurface(id): SurfaceModel<T> \| undefined` | Retrieves a surface by ID.                       |
| `dispose(): void`                              | Disposes all surfaces and clears event emitters. |

---

### `SurfaceModel` (class)

```ts
class SurfaceModel<T extends ComponentApi>
```

State model for a single UI surface. Coordinates the data model, component collection, action dispatching, and error reporting.

#### Constructor

```ts
new SurfaceModel(
  id: string,
  catalog: Catalog<T>,
  theme?: any,           // default: {}
  sendDataModel?: boolean  // default: false
)
```

#### Properties

| Property          | Type                            | Description                                               |
| ----------------- | ------------------------------- | --------------------------------------------------------- |
| `id`              | `string`                        | Surface identifier.                                       |
| `catalog`         | `Catalog<T>`                    | The catalog this surface uses.                            |
| `theme`           | `any`                           | Theme configuration.                                      |
| `sendDataModel`   | `boolean`                       | Whether the data model should be sent back to the server. |
| `dataModel`       | `DataModel`                     | The reactive data store for this surface.                 |
| `componentsModel` | `SurfaceComponentsModel`        | The collection of component models.                       |
| `onAction`        | `EventSource<A2uiClientAction>` | Fires when this surface dispatches an action.             |
| `onError`         | `EventSource<any>`              | Fires when this surface dispatches an error.              |

#### Methods

| Signature                                                   | Description                                                        |
| ----------------------------------------------------------- | ------------------------------------------------------------------ |
| `dispatchAction(payload, sourceComponentId): Promise<void>` | Validates and emits an action event from a component.              |
| `dispatchError(error): Promise<void>`                       | Emits an error event from this surface.                            |
| `dispose(): void`                                           | Disposes the data model, component collection, and event emitters. |

---

### `SurfaceComponentsModel` (class)

```ts
class SurfaceComponentsModel
```

Manages the collection of `ComponentModel` instances for a single surface.

#### Properties

| Property    | Type                                         | Description                                                    |
| ----------- | -------------------------------------------- | -------------------------------------------------------------- |
| `onCreated` | `EventSource<ComponentModel>`                | Fires when a component is added.                               |
| `onDeleted` | `EventSource<string>`                        | Fires when a component is removed (provides the component ID). |
| `entries`   | `IterableIterator<[string, ComponentModel]>` | Iterates over all `[id, ComponentModel]` pairs.                |

#### Methods

| Signature                              | Description                                                         |
| -------------------------------------- | ------------------------------------------------------------------- |
| `get(id): ComponentModel \| undefined` | Retrieves a component by ID.                                        |
| `addComponent(component): void`        | Adds a component. Throws `A2uiStateError` if the ID already exists. |
| `removeComponent(id): void`            | Removes and disposes a component.                                   |
| `dispose(): void`                      | Disposes all components and clears event emitters.                  |

---

### `ComponentModel` (class)

```ts
class ComponentModel
```

Represents the runtime state of a single UI component.

#### Constructor

```ts
new ComponentModel(id: string, type: string, initialProperties: Record<string, any>)
```

#### Properties

| Property        | Type                          | Description                                         |
| --------------- | ----------------------------- | --------------------------------------------------- |
| `id`            | `string`                      | Unique component identifier.                        |
| `type`          | `string`                      | Component type name (e.g. `'Button'`).              |
| `properties`    | `Record<string, any>`         | Current properties. Setting this fires `onUpdated`. |
| `onUpdated`     | `EventSource<ComponentModel>` | Fires whenever `properties` is set.                 |
| `componentTree` | `any`                         | `{ id, type, ...properties }` snapshot.             |

#### Methods

| Signature         | Description                 |
| ----------------- | --------------------------- |
| `dispose(): void` | Disposes the event emitter. |

---

### `DataModel` (class)

```ts
class DataModel
```

A standalone, JSON-Pointer-addressable, observable key-value store backed by Preact Signals.

#### Constructor

```ts
new DataModel(initialData?: Record<string, unknown>)
```

#### Methods

| Signature                                           | Description                                                                                                                                                                                                                 |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `get(path): any`                                    | Reads the value at a JSON Pointer path. Returns `undefined` if not found.                                                                                                                                                   |
| `set(path, value): this`                            | Writes a value at a JSON Pointer path, creating intermediate objects/arrays as needed. Setting to `undefined` deletes object keys or sets array slots to `undefined`. Notifies all ancestor, exact, and descendant signals. |
| `getSignal<T>(path): Signal<T \| undefined>`        | Returns a reactive Preact `Signal` for the path. Created on first access.                                                                                                                                                   |
| `subscribe<T>(path, onChange): DataSubscription<T>` | Subscribes to changes at the path. Fires `onChange` on every mutation that touches the path or its ancestors/descendants. Returns a `DataSubscription` with the current value and `unsubscribe()`.                          |
| `dispose(): void`                                   | Clears all subscriptions and signals.                                                                                                                                                                                       |

**Path conventions:** paths follow the [JSON Pointer (RFC 6901)](https://datatracker.ietf.org/doc/html/rfc6901) format (e.g. `/users/0/name`). Use `/` or `''` to address the root.

---

### State Model Types

| Name                  | Kind        | Description                                                   |
| --------------------- | ----------- | ------------------------------------------------------------- |
| `ActionListener`      | `type`      | `(action: A2uiClientAction) => void \| Promise<void>`         |
| `DataSubscription<T>` | `interface` | Extends `Subscription` with `readonly value: T \| undefined`. |

---

## 6. Events / Subscriptions

---

### `EventEmitter` (class)

```ts
class EventEmitter<T> implements EventSource<T>
```

Internal pub/sub implementation. Exposed so that custom catalog or renderer implementations can use it for their own event streams.

#### Methods

| Signature                           | Description                                                                                        |
| ----------------------------------- | -------------------------------------------------------------------------------------------------- |
| `subscribe(listener): Subscription` | Registers a listener and returns a `Subscription` for cleanup.                                     |
| `emit(data): Promise<void>`         | Calls all registered listeners sequentially. Errors in individual listeners are caught and logged. |
| `dispose(): void`                   | Removes all listeners.                                                                             |

---

### Event Types

| Name               | Kind        | Description                                                      |
| ------------------ | ----------- | ---------------------------------------------------------------- |
| `Subscription`     | `interface` | `{ unsubscribe(): void }` — returned by every subscribe call.    |
| `EventListener<T>` | `type`      | `(data: T) => void \| Promise<void>`                             |
| `EventSource<T>`   | `interface` | Read-only view of an `EventEmitter`: only exposes `subscribe()`. |

---

## 7. Schema — Common Types

Zod schemas and matching TypeScript types for A2UI's core data primitives. All types are dual-exported: as Zod schemas (for runtime parsing/validation) and as TypeScript `type` aliases.

---

### Common Type Zod Schemas

| Schema                          | Represents                                                                                   |
| ------------------------------- | -------------------------------------------------------------------------------------------- |
| `DataBindingSchema`             | `{ path: string }` — a JSON Pointer reference                                                |
| `FunctionCallSchema`            | `{ call: string; args: Record<string,any>; returnType?: A2uiReturnType }`                    |
| `DynamicStringSchema`           | `string \| DataBinding \| FunctionCall`                                                      |
| `DynamicNumberSchema`           | `number \| DataBinding \| FunctionCall`                                                      |
| `DynamicBooleanSchema`          | `boolean \| DataBinding \| FunctionCall`                                                     |
| `DynamicStringListSchema`       | `string[] \| DataBinding \| FunctionCall`                                                    |
| `DynamicValueSchema`            | Any of the above literal types, or `DataBinding`, or `FunctionCall`                          |
| `ComponentIdSchema`             | `string` — unique component identifier                                                       |
| `ChildListSchema`               | `ComponentId[] \| { componentId: ComponentId; path: string }` — static or dynamic child list |
| `ActionSchema`                  | `{ event: { name, context? } } \| { functionCall: FunctionCall }`                            |
| `CheckRuleSchema`               | `{ condition: DynamicBoolean; message: string }`                                             |
| `CheckableSchema`               | `{ checks?: CheckRule[] }`                                                                   |
| `AccessibilityAttributesSchema` | `{ label?: DynamicString; description?: DynamicString }`                                     |
| `AnyComponentSchema`            | `{ component: string; id?: ComponentId; weight?: number; [key: string]: any }`               |

---

### Common Type TypeScript Types

`DataBinding`, `FunctionCall`, `DynamicString`, `DynamicNumber`, `DynamicBoolean`, `DynamicStringList`, `DynamicValue`, `ComponentId`, `ChildList`, `Action`, `CheckRule`, `Checkable`, `AccessibilityAttributes`, `AnyComponent`

Each is `z.infer<typeof <Schema>>`.

---

### `CommonSchemas` namespace

```ts
const CommonSchemas: {
  ComponentId;
  ChildList;
  DataBinding;
  DynamicValue;
  DynamicString;
  DynamicNumber;
  DynamicBoolean;
  DynamicStringList;
  FunctionCall;
  CheckRule;
  Checkable;
  Action;
  AccessibilityAttributes;
  AnyComponent;
};
```

A convenience object grouping all common Zod schemas under a single import.

---

## 8. Schema — Server-to-Client Messages

Zod schemas and TypeScript types for messages sent by an A2UI server to the client.

### Zod Schemas

| Schema                          | Validates                                                                              |
| ------------------------------- | -------------------------------------------------------------------------------------- |
| `CreateSurfaceMessageSchema`    | `{ version: 'v0.9'; createSurface: { surfaceId, catalogId, theme?, sendDataModel? } }` |
| `UpdateComponentsMessageSchema` | `{ version: 'v0.9'; updateComponents: { surfaceId, components: AnyComponent[] } }`     |
| `UpdateDataModelMessageSchema`  | `{ version: 'v0.9'; updateDataModel: { surfaceId, path?, value? } }`                   |
| `DeleteSurfaceMessageSchema`    | `{ version: 'v0.9'; deleteSurface: { surfaceId } }`                                    |
| `A2uiMessageSchema`             | Union of all four message schemas above                                                |
| `A2uiMessageListSchema`         | `A2uiMessage[]`                                                                        |
| `A2uiMessageListWrapperSchema`  | `{ messages: A2uiMessage[] }`                                                          |

### TypeScript Types

`CreateSurfaceMessage`, `UpdateComponentsMessage`, `UpdateDataModelMessage`, `DeleteSurfaceMessage`, `A2uiMessage` (union), `A2uiMessageList`, `A2uiMessageListWrapper`

---

## 9. Schema — Client Capabilities

Interfaces (no Zod schemas) describing the metadata the client sends to the server.

| Name                     | Description                                                                                                      |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `JsonSchema`             | `Record<string, any>` — a JSON Schema definition object.                                                         |
| `FunctionDefinition`     | `{ name, description?, parameters: JsonSchema, returnType: A2uiReturnType }`                                     |
| `InlineCatalog`          | `{ catalogId, components?, functions?, theme? }` — full catalog definition embedded in the capabilities payload. |
| `A2uiClientCapabilities` | `{ 'v0.9': { supportedCatalogIds: string[]; inlineCatalogs?: InlineCatalog[] } }`                                |

---

## 10. Schema — Client-to-Server Messages

Zod schemas and TypeScript types for messages the client sends to the server.

### Zod Schemas

| Schema                               | Validates                                                               |
| ------------------------------------ | ----------------------------------------------------------------------- |
| `A2uiClientActionSchema`             | `{ name, surfaceId, sourceComponentId, timestamp (ISO 8601), context }` |
| `A2uiValidationErrorSchema`          | `{ code: 'VALIDATION_FAILED', surfaceId, path, message }`               |
| `A2uiGenericErrorSchema`             | `{ code (not VALIDATION_FAILED), message, surfaceId, …rest }`           |
| `A2uiClientErrorSchema`              | Union of validation and generic error schemas                           |
| `A2uiClientMessageSchema`            | `{ version: 'v0.9' } & ({ action } \| { error })`                       |
| `A2uiClientDataModelSchema`          | `{ version: 'v0.9'; surfaces: Record<string, object> }`                 |
| `A2uiClientMessageListSchema`        | `A2uiClientMessage[]`                                                   |
| `A2uiClientMessageListWrapperSchema` | `{ messages: A2uiClientMessage[] }`                                     |

### TypeScript Types

`A2uiClientAction`, `A2uiClientError`, `A2uiClientMessage`, `A2uiClientDataModel`, `A2uiClientMessageList`, `A2uiClientMessageListWrapper`

---

## 11. Errors

All A2UI errors extend `A2uiError` and carry a machine-readable `code` string.

| Class                 | `code`               | Thrown when                                                                                                |
| --------------------- | -------------------- | ---------------------------------------------------------------------------------------------------------- |
| `A2uiError`           | `'UNKNOWN_ERROR'`    | Base class. Not thrown directly.                                                                           |
| `A2uiValidationError` | `'VALIDATION_ERROR'` | JSON validation fails or schemas are mismatched. Has an optional `details` property.                       |
| `A2uiDataError`       | `'DATA_ERROR'`       | Invalid JSON Pointer path or type mismatch during a `DataModel` mutation. Has an optional `path` property. |
| `A2uiExpressionError` | `'EXPRESSION_ERROR'` | String interpolation or function evaluation failure. Has optional `expression` and `details` properties.   |
| `A2uiStateError`      | `'STATE_ERROR'`      | Structural issue in the UI tree (e.g. duplicate surface, missing component).                               |

All classes extend the native `Error`, have `name` set to the class name, and capture a V8 stack trace when available.

---

## 12. Raw JSON Schemas

```ts
const Schemas: {
  A2uiMessageSchemaRaw: object;
};
```

`A2uiMessageSchemaRaw` is the raw JSON Schema object (loaded from the generated `schemas/server_to_client.json` file at build time). It can be used with JSON Schema validators such as [Ajv](https://ajv.js.org/) for server-side validation or documentation tooling.

````ts
import Ajv from "ajv";
import { Schemas } from "@a2ui/web-core"`      | Structural issue in the UI tree (e.g. duplicate surface, missing component).                               |

All classes extend the native `Error`, have `name` set to the class name, and capture a V8 stack trace when available.

---

## 12. Raw JSON Schemas

```ts
const Schemas: {
  A2uiMessageSchemaRaw: object;
};
````

`A2uiMessageSchemaRaw` is the raw JSON Schema object (loaded from the generated `schemas/server_to_client.json` file at build time). It can be used with JSON Schema validators such as [Ajv](https://ajv.js.org/) for server-side validation or documentation tooling.

```ts
import Ajv from "ajv";
import { Schemas } from "@a2ui/web-core";

const ajv = new Ajv();
const validate = ajv.compile(Schemas.A2uiMessageSchemaRaw);
const valid = validate(myMessage);
```
