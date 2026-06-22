// design-sync only: React Compiler runtime polyfill.
//
// @elmethis/react is built with babel-plugin-react-compiler, so its compiled
// components import `c` (the memo-cache hook) from "react/compiler-runtime".
// The converter's bundler shims every `react*` specifier to `window.React`,
// which does NOT expose `c` — so without this, every compiler-optimized
// component (icons, audio player, clipboard, …) throws
// "import_compiler_runtime.c is not a function" and renders empty.
//
// This is the canonical, version-independent memo-cache polyfill (same shape
// as the `react-compiler-runtime` npm package): a stable per-instance array
// filled with React's memo-cache sentinel, which the compiler-generated code
// checks before recomputing. Aliased in for "react/compiler-runtime" via
// cfg.tsconfig paths (which resolve before the bundler's react shim).
import * as React from "react";

const $empty = Symbol.for("react.memo_cache_sentinel");

export function c(size) {
  // React 19.2+ exposes a real memo-cache implementation; prefer it when present
  // so behavior matches the host runtime exactly, else fall back to the polyfill.
  const native = React.__COMPILER_RUNTIME && React.__COMPILER_RUNTIME.c;
  if (typeof native === "function") return native(size);

  const ref = React.useRef(null);
  if (ref.current === null) {
    const cache = new Array(size);
    for (let i = 0; i < size; i++) cache[i] = $empty;
    ref.current = cache;
  }
  return ref.current;
}

export default { c };
