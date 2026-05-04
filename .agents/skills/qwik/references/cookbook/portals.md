# Cookbook: Portals

> Source: `packages/docs/src/routes/docs/cookbook/portals/index.mdx`

## Overview

Portals render a component in a different part of the DOM than where it was triggered (e.g., modals, tooltips). Classic React `createPortal()` does not work well with SSR.

Qwik recommends native browser APIs that are SSR-friendly:

## Modal overlays — `<dialog>` element

Use the native `<dialog>` element's `showModal()` method, which automatically renders in the browser's top layer.

[Qwik UI's Modal component](https://qwikui.com/docs/headless/modal/) wraps this and adds:

- Focus locking
- Scroll locking
- Alert dialog support
- Entry/exit animation support
- Backdrop animations

## Non-modal overlays — Popover API

For popovers, tooltips, dropdowns, toasts, and similar non-modal UI, use the [Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API).

[Qwik UI's Popover component](https://qwikui.com/docs/headless/popover/) provides a polyfill with full spec parity, available in all major browsers today.

For floating behavior (e.g., a listbox anchored to an input), use `floating={true}` on the Qwik UI Popover component. This is intentionally opt-in — the CSS Anchor API will eventually replace it.

## Key points

- Built on native browser specs → less JS to prefetch.
- Works regardless of meta-framework or microfrontend setup.
- No need for a React-like `createPortal()`.
