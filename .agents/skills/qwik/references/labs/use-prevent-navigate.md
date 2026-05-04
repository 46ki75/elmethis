# 🧪 Labs: `usePreventNavigate`

> Source: `packages/docs/src/routes/docs/labs/usePreventNavigate/index.mdx`  
> Stage: **experimental** — [RFC](https://github.com/QwikDev/qwik-evolution/issues/15)

## Enable

```ts
// vite.config.ts — inside qwikVite options
experimental: ['preventNavigate']
```

## API

```ts
usePreventNavigate$(callback: (url: URL | undefined) => boolean | Promise<boolean>)
```

- `url` is the destination URL for Qwik City navigations, or `undefined` for browser-native navigations (reload, `<a>` without `<Link>`).
- Return `true` to **block** navigation.
- The callback may return a `Promise` for Qwik City navigations.
- For `url === undefined` (browser navigation), the response must be **synchronous** — no dialogs allowed.

## Example: confirm with a modal library

```tsx
export default component$(() => {
  const okToNavigate = useSignal(true);

  usePreventNavigate$((url) => {
    if (!okToNavigate.value) {
      if (!url) return true; // synchronous block for browser nav
      return confirmDialog(`Go to ${url}?`).then((answer) => !answer);
    }
  });

  return (
    <button onClick$={() => (okToNavigate.value = !okToNavigate.value)}>
      Toggle dirty state
    </button>
  );
});
```

## Example: inline modal

```tsx
export default component$(() => {
  const okToNavigate = useSignal(true);
  const pendingNav = useSignal<URL>();
  const showConfirm = useSignal(false);
  const nav = useNavigate();

  usePreventNavigate$((url) => {
    if (!okToNavigate.value) {
      if (url) { pendingNav.value = url; showConfirm.value = true; }
      return true;
    }
  });

  return (
    <>
      {showConfirm.value && (
        <div>
          <p>Go to {String(pendingNav.value)}?</p>
          <button onClick$={() => { okToNavigate.value = true; nav(pendingNav.value!); }}>Yes</button>
          <button onClick$={() => (showConfirm.value = false)}>No</button>
        </div>
      )}
    </>
  );
});
```

## Key points

- `url === undefined` means the browser is navigating away — respond synchronously, no UI dialogs.
- `url !== undefined` means Qwik City SPA navigation — can show async UI.
- Must enable the experimental flag in `qwikVite`.
