// design-sync slim shiki shim.
//
// The DS's published code does `import { codeToHtml } from "shiki"`, which pulls
// shiki's FULL bundle (~9.5 MB of grammars + themes) into the design-sync bundle
// and blows past claude.ai/design's 5 MB per-file upload cap. This module is
// aliased in for the bare `shiki` specifier (via cfg.tsconfig paths) and exposes
// the same `codeToHtml` API, but bundles only a curated set of common languages
// using @shikijs/core + the inlined Oniguruma WASM engine. Themes are passed as
// objects per call by the component, so no theme bundle is needed. Any language
// not in the curated set throws "language not found" — which ElmShikiHighlighter
// already catches and degrades to a readable plain <pre>. Same library, smaller
// configuration; the component code is untouched.
import { createBundledHighlighter, createSingletonShorthands } from "@shikijs/core";
import { createOnigurumaEngine } from "@shikijs/engine-oniguruma";

const bundledLanguages = {
  javascript: () => import("@shikijs/langs/javascript"),
  js: () => import("@shikijs/langs/javascript"),
  jsx: () => import("@shikijs/langs/jsx"),
  typescript: () => import("@shikijs/langs/typescript"),
  ts: () => import("@shikijs/langs/typescript"),
  tsx: () => import("@shikijs/langs/tsx"),
  json: () => import("@shikijs/langs/json"),
  jsonc: () => import("@shikijs/langs/jsonc"),
  html: () => import("@shikijs/langs/html"),
  xml: () => import("@shikijs/langs/xml"),
  css: () => import("@shikijs/langs/css"),
  scss: () => import("@shikijs/langs/scss"),
  less: () => import("@shikijs/langs/less"),
  bash: () => import("@shikijs/langs/bash"),
  sh: () => import("@shikijs/langs/bash"),
  shell: () => import("@shikijs/langs/bash"),
  shellscript: () => import("@shikijs/langs/bash"),
  python: () => import("@shikijs/langs/python"),
  py: () => import("@shikijs/langs/python"),
  rust: () => import("@shikijs/langs/rust"),
  rs: () => import("@shikijs/langs/rust"),
  go: () => import("@shikijs/langs/go"),
  yaml: () => import("@shikijs/langs/yaml"),
  yml: () => import("@shikijs/langs/yaml"),
  markdown: () => import("@shikijs/langs/markdown"),
  md: () => import("@shikijs/langs/markdown"),
  sql: () => import("@shikijs/langs/sql"),
  java: () => import("@shikijs/langs/java"),
  c: () => import("@shikijs/langs/c"),
  cpp: () => import("@shikijs/langs/cpp"),
  csharp: () => import("@shikijs/langs/csharp"),
  cs: () => import("@shikijs/langs/csharp"),
  php: () => import("@shikijs/langs/php"),
  ruby: () => import("@shikijs/langs/ruby"),
  rb: () => import("@shikijs/langs/ruby"),
  kotlin: () => import("@shikijs/langs/kotlin"),
  swift: () => import("@shikijs/langs/swift"),
  toml: () => import("@shikijs/langs/toml"),
  dockerfile: () => import("@shikijs/langs/docker"),
  docker: () => import("@shikijs/langs/docker"),
  graphql: () => import("@shikijs/langs/graphql"),
  diff: () => import("@shikijs/langs/diff"),
  ini: () => import("@shikijs/langs/ini"),
  lua: () => import("@shikijs/langs/lua"),
  powershell: () => import("@shikijs/langs/powershell"),
  ps1: () => import("@shikijs/langs/powershell"),
};

const createHighlighter = createBundledHighlighter({
  langs: bundledLanguages,
  themes: {},
  engine: () => createOnigurumaEngine(import("@shikijs/engine-oniguruma/wasm-inlined")),
});

export const { codeToHtml, codeToHast, codeToTokens } =
  createSingletonShorthands(createHighlighter);

export default { codeToHtml, codeToHast, codeToTokens };
