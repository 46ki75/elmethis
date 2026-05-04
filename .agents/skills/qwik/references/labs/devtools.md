# 🧪 Labs: Devtools

> Source: `packages/docs/src/routes/docs/labs/devtools/index.mdx`  
> Stage: **prototyping**

## Purpose

Utilities to inspect and understand Qwik's serialized application state.

## Parsing `qwik/json`

Qwik serializes application state into `<script type="qwik/json">`. The format is compact and hard to read manually.

### How to use

1. Open browser DevTools → Console.
2. Run:

   ```js
   import("https://qwik.dev/devtools/json/");
   ```

3. The script parses the `qwik/json` blob and logs a human-readable object.

### Output structure

| Key | Meaning |
| ----- | --------- |
| `objs` | All serialized objects |
| `ctx` | `QContext` objects (component state + tasks) |
| `refs` | `QRef` objects (element listeners + captured vars) |
| `sub` | `QSubscription` objects |

### `__backRef`

Every serialized object includes `__backRef` pointing to the object that causes it to be retained.
Trace `__backRef` chains back to `QContext` or `QRef` roots to understand *why* a given object is
being serialized.

## Key points

- Only objects reachable from `QContext` (component state) or `QRef` (event listeners) are serialized.
- If an unexpected object is serialized, trace `__backRef` to find the cause.
- Refactoring to reduce captured scope can eliminate unnecessary serialization.
