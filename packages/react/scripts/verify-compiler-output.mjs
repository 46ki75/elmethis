import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * CI guard: asserts that the published bundles were actually run through React
 * Compiler. Because consumer build pipelines never compile node_modules, our
 * published output is the *only* place the compiler can run — if it silently
 * stops applying (a plugin reorder, a dropped dependency, a Vite/plugin-react
 * upgrade that changes the API again), the library ships unoptimized and no test
 * would notice. This makes that regression a hard build failure.
 *
 * For each bundle we check three things:
 *   1. it imports the memo-cache hook `c` from `react/compiler-runtime`;
 *   2. that hook is actually *called* at a meaningful number of sites (the
 *      compiler emits `<alias>(<slotCount>)` per compiled function — a runtime
 *      import with zero call sites would mean nothing got compiled);
 *   3. the React 17/18 shim `react-compiler-runtime` did NOT leak in (we target
 *      React 19, whose runtime is built in; the shim showing up means a stray
 *      `target` option crept into the config).
 */

const root = path.resolve(fileURLToPath(import.meta.url), "../..");

// Minimum compiled call sites we expect across the whole library. Set well
// below the current count (~79 in ESM) so ordinary refactors don't trip it,
// but high enough that "the compiler ran on basically nothing" still fails.
const MIN_CALL_SITES = 20;

const RUNTIME = "react/compiler-runtime";
const SHIM = "react-compiler-runtime";

const bundles = ["lib/index.react.mjs", "lib/index.react.cjs"];

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// The runtime export is the memo-cache hook `c`, but the bundler renames or
// namespaces it, so we can't grep a fixed token. Both shapes we emit are:
//   ESM  — `import{c as e}from"react/compiler-runtime"`        → calls `e(<n>)`
//   CJS  — `let c=require("react/compiler-runtime")` namespace → calls `(0,c.c)(<n>)`
// We locate whichever import shape the bundle uses, then return a regex that
// counts that binding's numeric-argument call sites (the `<n>` is the compiler's
// per-function slot count).
const callSiteRegex = (source) => {
  // Named/destructured import: `import{c as e}` (ESM) or `{c:e}=require(...)` (CJS).
  const named =
    source.match(
      /import\s*\{([^}]*)\}\s*from\s*[`"']react\/compiler-runtime[`"']/,
    ) ??
    source.match(
      /\{([^}]*)\}\s*=\s*require\(\s*[`"']react\/compiler-runtime[`"']\s*\)/,
    );
  if (named) {
    const clause = named[1];
    const aliased = clause.match(/\bc\s+(?:as|:)\s+(\w+)/); // `c as e` / `c: e`
    const alias = aliased ? aliased[1] : /\bc\b/.test(clause) ? "c" : null;
    if (alias) return new RegExp(`\\b${escapeRe(alias)}\\(\\d+\\)`, "g");
  }

  // Namespace import: `let c=require("react/compiler-runtime")`; the hook is
  // then invoked as `c.c(<n>)`, often wrapped `(0,c.c)(<n>)` to preserve `this`.
  const ns = source.match(
    /(\w+)\s*=\s*require\(\s*[`"']react\/compiler-runtime[`"']\s*\)/,
  );
  if (ns) return new RegExp(`\\b${escapeRe(ns[1])}\\.c\\)?\\(\\d+\\)`, "g");

  return null;
};

const countCallSites = (source) => {
  const re = callSiteRegex(source);
  if (!re) return null;
  const matches = source.match(re);
  return matches ? matches.length : 0;
};

let failed = false;
const fail = (file, msg) => {
  failed = true;
  console.error(`  ✗ ${file}: ${msg}`);
};

for (const rel of bundles) {
  const abs = path.join(root, rel);
  let source;
  try {
    source = await readFile(abs, "utf8");
  } catch {
    fail(rel, "bundle not found — run `pnpm run build.lib` first");
    continue;
  }

  if (!source.includes(RUNTIME)) {
    fail(rel, `missing "${RUNTIME}" import — React Compiler did not run`);
    continue;
  }

  if (source.includes(SHIM)) {
    fail(
      rel,
      `unexpected "${SHIM}" shim — drop the \`target\` option (we target React 19)`,
    );
  }

  const callSites = countCallSites(source);
  if (callSites === null) {
    fail(rel, `could not locate the compiler-runtime import binding`);
    continue;
  }

  if (callSites < MIN_CALL_SITES) {
    fail(
      rel,
      `only ${callSites} memo-cache call sites (expected ≥ ${MIN_CALL_SITES}) — almost nothing was compiled`,
    );
    continue;
  }

  console.log(`  ✓ ${rel}: compiled (${callSites} memo-cache call sites)`);
}

if (failed) {
  console.error("\nReact Compiler output verification failed.");
  process.exit(1);
}

console.log("React Compiler output verified.");
