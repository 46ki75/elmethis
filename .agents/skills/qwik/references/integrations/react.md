# Integration: Qwik React (`qwik-react`)

> Source: `packages/docs/src/routes/docs/integrations/react/index.mdx`

## Purpose

Use existing React components inside Qwik by wrapping them with `qwikify$()`. The React component becomes a Qwik island — you control when it hydrates.

## Installation

```bash
pnpm run qwik add react
```

Installs: `@builder.io/qwik-react`, `react`, `react-dom`, `@types/react`, `@types/react-dom`.  
Updates `vite.config.ts` with the `qwikReact()` plugin.

## Basic usage

```tsx
/** @jsxImportSource react */
import { qwikify$ } from '@builder.io/qwik-react';

function Greetings() {
  return <div>Hello from React</div>;
}

export const QGreetings = qwikify$(Greetings);
```

Use in a Qwik component:

```tsx
import { QGreetings } from './react';
export default component$(() => <QGreetings />);
```

## Hydration strategies

| Prop | When the React component hydrates |
| ------ | ---------------------------------- |
| `client:load` | Immediately on load |
| `client:visible` | When the component enters the viewport |
| `client:idle` | When the browser is idle |
| `client:hover` | On mouse hover |
| `client:signal={sig}` | When a signal becomes truthy |
| `client:event="click"` | On a DOM event |
| `client:only` | CSR only — no SSR |
| *(none)* | Never — static SSR only |

```tsx
<QCounter client:visible />
```

## Passing state to React

Qwik signals can be passed as props. The React component re-renders when the signal changes.

```tsx
const count = useSignal(0);
<QCounter count={count.value} client:visible />
```

## Event handlers

Qwik `$()` functions can be passed as event handlers:

```tsx
<QButton onClick$={() => console.log('clicked')} client:visible />
```

## Files convention

- Place React components in `src/integrations/react/` (created by `qwik add react`).
- Each file must have `/** @jsxImportSource react */` at the top.
- React and Qwik components cannot be mixed in the same file.

## Key points

- `qwikify$()` creates a Qwik island; React only ships to the client when hydration is triggered.
- No emulation — actual React 18 is used.
- Ideal for migrating existing React apps incrementally.
