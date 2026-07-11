# `pkce-challenge` breaks Vite/bundler resolution

A real-world quirk of the official **TypeScript** MCP SDK
(`@modelcontextprotocol/sdk` npm package) and its transitive dependency
`pkce-challenge` — not part of the MCP spec itself and not applicable to
other-language SDKs (Python, Rust, etc.), but reliably encountered when
shipping the TypeScript SDK in browser-targeted builds.

## Symptom

Building an app that depends on `@modelcontextprotocol/sdk` (directly or
transitively, e.g. via `@elmethis/qwik`'s `ag-ui-client`) fails during the
client/SSR build with a resolver error for `pkce-challenge`, even when the app
never reaches any OAuth code path at runtime.

## Why it happens

```text
your-app
  └─ await import('@modelcontextprotocol/sdk/client/streamableHttp.js')   ← dynamic
       └─ import { auth, … } from './auth.js'                              ← static
            └─ import pkceChallenge from 'pkce-challenge'                  ← static
```

- The MCP SDK's `streamableHttp.js` (any version supporting OAuth) statically
  imports `./auth.js`, which statically imports `pkce-challenge`. Wrapping the
  SDK in a dynamic `import()` only puts it in a separate chunk — Vite still
  walks the full static graph of that chunk at build time.
- `pkce-challenge`'s `package.json` (≤5.0.1) has an `exports` field with
  `browser`, `node.import`, and `node.require` conditions but **no `default`
  condition.** Under Vite's SSR/Qwik client builds where neither the `browser`
  nor `node` conditions resolve cleanly, the resolver fails the whole build.

## Fix (consumer app)

Alias `pkce-challenge` to a local stub in `vite.config.ts`:

```ts
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      "pkce-challenge": fileURLToPath(
        new URL("./src/stubs/pkce-challenge.ts", import.meta.url),
      ),
    },
  },
});
```

```ts
// src/stubs/pkce-challenge.ts
export default async function pkceChallenge(): Promise<{
  code_verifier: string;
  code_challenge: string;
}> {
  throw new Error("pkce-challenge is stubbed in this build");
}
export async function verifyChallenge(): Promise<boolean> {
  throw new Error("pkce-challenge is stubbed in this build");
}
```

The `throw` is deliberate. If the OAuth code path is ever reached at runtime
you want a loud error, not silent broken crypto. If the app actually needs
OAuth, drop the alias and ship a real implementation instead — don't quietly
make the stub return fake values.

## What *not* to do

- Don't try to lazy-import the SDK to escape this — Vite resolves the static
  graph behind every dynamic chunk, so it can't be sidestepped at the call
  site.
- Don't suggest the upstream library (`@elmethis/qwik`, etc.) "fix it" purely
  in its own source — it can document the alias or ship a Vite plugin that
  injects the alias, but it cannot remove the static import from the SDK.

## Upstream fix

The proper resolution is a one-line `"default": "./dist/index.node.js"` (or
equivalent) added to `pkce-challenge`'s `exports` field, or a PR against the
MCP SDK to lazy-import `pkce-challenge` only when an `authProvider` is
configured. Until either lands, the consumer-side alias is the standard
workaround.

## Identifying this issue

If a user reports a Vite/Rollup/Webpack resolver error mentioning
`pkce-challenge` while building an app that uses `@modelcontextprotocol/sdk`
(or any library that does — `ag-ui-client`, custom MCP clients, etc.), this
is almost certainly the cause. The fix is the alias above, not a code change
to their app or the consuming library.
