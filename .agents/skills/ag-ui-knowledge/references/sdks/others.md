# Other SDKs

Source: `submodules/ag-ui/docs/sdk/**` and the upstream `sdks/community/`
directory.

Brief pointers for the community SDKs. Open this file when someone asks
"is there an AG-UI SDK for X?" or needs an install hint. All listed SDKs
implement the same wire protocol as the TypeScript and Python SDKs — the
event taxonomy, message types, and run contract in `concepts/` apply
verbatim.

## Status overview

| Language | Status | Where to look |
| --- | --- | --- |
| TypeScript / JavaScript | 1st-party (see `sdks/typescript.md`) | `submodules/ag-ui/sdks/typescript/packages/` |
| Python | 1st-party (see `sdks/python.md`) | `submodules/ag-ui/sdks/python/` |
| Rust | Community, supported | `submodules/ag-ui/sdks/community/rust/` |
| Java | Community, supported | `submodules/ag-ui/docs/sdk/java/overview.mdx` |
| Kotlin | Community, supported | `submodules/ag-ui/docs/sdk/kotlin/overview.mdx` |
| Go | Community, supported | `submodules/ag-ui/docs/sdk/go/overview.mdx` |
| Dart | Community, supported | `submodules/ag-ui/sdks/community/dart/` |
| Ruby | Community, supported | `submodules/ag-ui/sdks/community/ruby/` |
| .NET | In progress | upstream PR #38 |
| Nim | In progress | upstream PR #29 |
| Flowise | In progress | upstream issue #367 |
| Langflow | In progress | upstream issue #366 |
| Cloudflare Agents | In progress | upstream PR #655 |

## Rust

Upstream: `submodules/ag-ui/sdks/community/rust/crates/ag-ui-client/`

```bash
cargo add ag-ui-client
```

Provides:

- `Agent` trait — equivalent of `AbstractAgent`.
- `HttpAgent` implementation for connecting to AG-UI endpoints.
- Subscriber/observer patterns over the event stream.
- Core types (events, messages, RunAgentInput) generated to match the
  TypeScript schema.

For the latest docs, read the source `README.md` in the crate directory —
the docs site references the GitHub source rather than maintaining separate
prose.

## Java

Upstream docs: `submodules/ag-ui/docs/sdk/java/`

Provides client (`HttpAgent`, `AbstractAgent`, `Subscriber`), core types,
and a Spring-integration server module. The package layout mirrors the
TypeScript SDK closely — same conceptual API surface, idiomatic Java.

## Kotlin

Upstream docs: `submodules/ag-ui/docs/sdk/kotlin/`

Provides multiple agent types, core types, and a tools package with an
executor and registry pattern. Suitable for JVM and Android targets.

## Go

Upstream docs: `submodules/ag-ui/docs/sdk/go/`

Provides an SSE client, core types, encoding, and error types. The client is
written idiomatic Go (channels over RxJS).

## Dart

Upstream: `submodules/ag-ui/sdks/community/dart/`

Provides client, core types, and an encoder. Useful for Flutter mobile apps.

## Ruby

Upstream: `submodules/ag-ui/sdks/community/ruby/`

Provides core types and an encoder. Useful for Rails/Sinatra backends.

## When using a community SDK

- The **wire protocol is the same** as TypeScript/Python — events,
  RunAgentInput, message types, interrupt outcomes all match.
- API ergonomics differ per language (RxJS in TS/JS, async generators in
  Python, channels in Go, Coroutines in Kotlin/Rust). The mapping is
  mechanical once you know the events.
- Community SDKs may lag behind the spec by a release or two. Cross-reference
  the event types you need against `concepts/events.md`; if something is
  missing, file or check an upstream issue.
- Some community SDKs only ship the client. For server-side implementations
  in those languages, you can still emit AG-UI events manually using the
  HTTP+SSE contract from `quickstart/server.md` (the format is just JSON
  over SSE).

## See also

- `sdks/typescript.md` — the reference 1st-party SDK
- `sdks/python.md` — the reference 1st-party SDK
- `integrations.md` — framework-level integrations (LangGraph, Mastra,
  CopilotKit, etc.), which often bundle client/server pieces
