# Cookbook: Drag & Drop

> Source: `packages/docs/src/routes/docs/cookbook/drag&drop/index.mdx`

## Overview

Qwik processes events asynchronously, which breaks several drag-and-drop APIs:

- `event.preventDefault()` — must be called synchronously.
- `e.dataTransfer.getData()` / `setData()` — must be called synchronously.

## Solutions

| Technique | Usage |
| ----------- | ------- |
| `preventdefault:dragover` / `preventdefault:drop` attributes | Prevent default without JS |
| `sync$()` | Synchronous portion of event handler |
| `$()` chained after `sync$()` | Async portion that can read Qwik state |
| `element.dataset` | Pass data from `sync$` to `$` via DOM attributes |

## Basic pattern

```tsx
import { component$, useSignal, sync$, $ } from '@builder.io/qwik';

export default component$(() => {
  const items = useSignal([{ id: 1, content: 'Item A' }]);

  return (
    <div
      preventdefault:dragover
      preventdefault:drop
      onDragOver$={sync$((_: DragEvent, el: HTMLDivElement) => {
        el.setAttribute('data-over', 'true');
      })}
      onDragLeave$={sync$((_: DragEvent, el: HTMLDivElement) => {
        el.removeAttribute('data-over');
      })}
      onDrop$={[
        // 1. sync part: read dataTransfer synchronously and stash in dataset
        sync$((e: DragEvent, el: HTMLDivElement) => {
          const id = e.dataTransfer?.getData('text');
          el.dataset.droppedId = id;
          el.removeAttribute('data-over');
        }),
        // 2. async part: update Qwik state using the stashed id
        $((_e, el) => {
          const id = el.dataset.droppedId;
          if (id) {
            const itemId = parseInt(id);
            items.value = items.value.filter((i) => i.id !== itemId);
          }
        }),
      ]}
    >
      {items.value.map((item) => (
        <div
          key={item.id}
          data-id={item.id}
          draggable
          onDragStart$={sync$((e: DragEvent, el: HTMLDivElement) => {
            e.dataTransfer?.setData('text/plain', el.getAttribute('data-id')!);
          })}
        >
          {item.content}
        </div>
      ))}
    </div>
  );
});
```

## Key points

- Use `preventdefault:dragover` and `preventdefault:drop` HTML attributes to prevent default behavior without JS.
- `sync$()` cannot close over Qwik state — pass data via `element.dataset`.
- Chain handlers as an array `[sync$(...), $(...)]` to handle both sync and async needs.
- Add `playsinline` to `<video>` elements for consistent iOS behavior (unrelated but documented in the same area).
