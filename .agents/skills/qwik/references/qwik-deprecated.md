# Deprecated Features Migration Guide

> Sources:
>
> - `packages/docs/src/routes/docs/(qwik)/deprecated-features/index.mdx`
> - `packages/docs/src/routes/docs/(qwikcity)/qwikcity-deprecated-features/index.mdx`

## Qwik Core — Deprecated APIs

| Deprecated                                           | Replacement                    |
| ---------------------------------------------------- | ------------------------------ |
| `useWatch$`                                          | `useTask$`                     |
| `useMount$`                                          | `useTask$`                     |
| `useServerMount`                                     | `useTask$` + `isServer` check  |
| `useClientMount`                                     | `useTask$` + `isBrowser` check |
| `useClientEffect` / `useClientEffectQrl`             | `useVisibleTask$`              |
| `useBrowserVisibleTask` / `useBrowserVisibleTaskQrl` | `useVisibleTask$`              |
| `useEnvData`                                         | `useServerData`                |
| `useRef`                                             | `useSignal`                    |
| `createContext`                                      | `createContextId`              |

### Migration examples

```ts
// Before
useWatch$(async ({ track }) => { ... });
// After
useTask$(async ({ track }) => { ... });

// Before
useClientEffect$(() => { ... });
// After
useVisibleTask$(() => { ... });

// Before
const ctx = createContext<MyType>('my-ctx');
// After
const ctx = createContextId<MyType>('my-ctx');
```

## Qwik City — Deprecated APIs

| Deprecated              | Replacement    |
| ----------------------- | -------------- |
| `useEndpoint`           | `routeLoader$` |
| `loader$` / `loaderQrl` | `routeLoader$` |
| `action$` / `actionQrl` | `routeAction$` |

### Migration examples

```ts
// Before
export const useData = loader$(async () => fetchData());
// After
export const useData = routeLoader$(async () => fetchData());

// Before
export const useCreate = action$(async (form) => createItem(form));
// After
export const useCreate = routeAction$(async (form) => createItem(form));
```
