# rmcp (Rust SDK for MCP)

Expert guidance on [`rmcp`](https://docs.rs/rmcp), the official Rust SDK
for the [Model Context Protocol](https://modelcontextprotocol.io/). Goal:
help users write correct, idiomatic `rmcp` code — servers, clients, tools,
prompts, resources, tasks, transports, and test harnesses — without
re-discovering the same macro contracts and trait shapes every time.

`rmcp` is **fast-moving and lightly documented**. This reference set targets
the released `rmcp` 2.2.0 source at commit
`519577601db3823616dbd7c4eb84ed569d8e17d4`. When a signature here conflicts
with the version resolved by your project, trust your resolved crate source
or the current docs.rs documentation and update the files. Do not assume a
vendored SDK checkout exists in every workspace.

For protocol-level questions (the JSON-RPC wire format, spec versions,
what a `tools/call` request looks like across implementations), use the
per-spec-version reference files in sibling directories
(`references/2024-11-05/`, `references/2025-03-26/`, `references/2025-06-18/`,
`references/2025-11-25/`). This section stays Rust-specific.

## Workspace orientation

The `rmcp` workspace ships two crates plus a large set of examples:

| Crate / directory                               | What it is                                                                                                                                                                                          |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `https://github.com/modelcontextprotocol/rust-sdk/tree/main/crates/rmcp/`        | The main `rmcp` crate. Re-exports everything the user sees: `ServerHandler`, `ClientHandler`, `ServiceExt`, `model::*`, `transport::*`, `task_manager::*`                                           |
| `https://github.com/modelcontextprotocol/rust-sdk/tree/main/crates/rmcp-macros/` | The procedural macros behind `#[tool_router]`, `#[tool_handler]`, `#[prompt_router]`, `#[prompt_handler]`, `#[task_handler]`. Re-exported by `rmcp` when the `macros` feature is on                    |
| `https://github.com/modelcontextprotocol/rust-sdk/tree/main/examples/`           | Server and client examples for primitives, transports, OAuth, tasks, sampling, elicitation, completion, and structured output                                                                         |
| `crates/mcp-server/`                            | **Local** working server example built against `rmcp` 2.2. Covers every server-side primitive and ships an integration test per feature. This is the canonical reference cited throughout this set  |

Application code depends on `rmcp` (plus whichever transport feature it
needs). `rmcp-macros` is pulled in transitively by the `macros` feature
— never depend on it directly.

## Version and stability note

This material targets **`rmcp` 2.2.0** (the workspace requires it at
`Cargo.toml:50`). Version 2.0.0 was a breaking release
(`feat!: align model types with MCP 2025-11-25 spec`, upstream PR #927):
most model types moved from public-field struct literals to
`::new(...)` constructors plus `.with_*(...)` builder methods, and the
`Content` / `Resource` / `ResourceTemplate` types are no longer
`Annotated<Raw*>` wrappers — `annotations` and `_meta` are now inline
fields on flat, `#[non_exhaustive]` structs. See
`references/rust-sdk/server/tools.md` and
`references/rust-sdk/server/resources.md` for the exact shapes. The SDK
is officially Tier 2 conformance — most of the 2025-11-25 MCP spec
works, but pieces like prompt argument substitution, embedded resources
in prompts, DNS-rebinding protection, and full SEP-1330 enum inference
are still in motion. Specific known limitations:

- Sampling, Logging, and Roots are `#[deprecated]` as of 2.0.0 per
  SEP-2577 (the types and methods still work — they emit a compiler
  warning, not a hard error). `crates/mcp-server/src/tools.rs` still
  demonstrates `ask_llm` (sampling) and `list_workspace_roots` (roots)
  behind `#[allow(deprecated)]`, since both remain part of the protocol
  today. Expect them to be removed in a future major version.
- `OperationProcessor` does not yet expose per-task `created_at` /
  `last_updated_at` — `tasks/list` overrides have to fake the
  timestamps. See `references/rust-sdk/server/tasks.md`.
- The macro-generated `list_tasks` only surfaces _running_ tasks; the
  canonical pattern (in `crates/mcp-server/src/tasks.rs`) is to override
  it and merge in `peek_completed()`.
- Some `ServerResult::*` variants share wire shape after `serde`
  flattening (most prominently `CancelTaskResult` vs `GetTaskResult`),
  so the untagged enum may pick the wrong variant when deserializing.
  Callers must accept either. See `references/rust-sdk/client/requests.md`.
- `Peer::elicit` returns `Err(ElicitationError::UserDeclined)` etc. for
  _user actions_, which are not service failures. Tools must
  pattern-match on `ElicitationError` and return
  `CallToolResult::success` for the user-action variants. See
  `references/rust-sdk/server/elicitation.md`.

The 2.1 and 2.2 releases add no source-breaking server API changes, but they
fix protocol-version negotiation, cancel-safe async reads, cancelled-request
responses, and orphaned Streamable HTTP responses after reinitialization.
Review `references/rust-sdk/migration-2.2.md` before upgrading from 2.0.

When you hit something that looks broken, inspect the exact resolved source
for your version (for example, with `cargo metadata` and the Cargo registry
source) before guessing.

## Feature flags at a glance

Defaults in `rmcp` 2.2.0:
`default = ["base64", "macros", "server"]`. So `cargo add rmcp` gives
you a server crate with macros and base64 image support. You still need
to **opt in** to the transports and to client-side support.

| Flag                                                         | When to enable                                                                      |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| `server`                                                     | Authoring a server. Pulls in `ServerHandler`, `schemars`, `transport-async-rw`      |
| `client`                                                     | Authoring or testing a client. Adds `ClientHandler`, `tokio-stream`                 |
| `macros`                                                     | `#[tool_router]` / `#[tool]` / `#[prompt_router]` / `#[prompt]` / `#[task_handler]` |
| `transport-io`                                               | stdio transport (`rmcp::transport::stdio()`)                                        |
| `transport-streamable-http-server`                           | Streamable HTTP server (`StreamableHttpService`, axum / tower integration)          |
| `transport-streamable-http-client-reqwest`                   | Streamable HTTP client with reqwest backend                                         |
| `transport-child-process`                                    | Spawn a server as a subprocess and talk to it over stdio                            |
| `elicitation`                                                | `rmcp::elicit_safe!`, `ElicitationError`, typed `Peer::elicit<T>()`                 |
| `schemars`                                                   | JSON Schema generation for tool/prompt argument types (auto-on with `server`)       |
| `auth` / `auth-client-credentials-jwt`                       | OAuth 2.0 client-credentials and JWT-signed assertions                              |
| `reqwest` / `reqwest-native-tls` / `reqwest-tls-no-provider` | Pick exactly one TLS strategy for the reqwest backend                               |

A common starter set for a server with stdio + HTTP + tasks +
elicitation is what `crates/mcp-server/` uses:

```toml
rmcp = { version = "2.2.0", features = [
    "server", "client", "macros",
    "transport-io",
    "transport-streamable-http-server",
    "schemars",
    "elicitation",
] }
```

See `references/rust-sdk/feature-flags.md` for the full list and the
`reqwest` TLS choice (which is easy to get wrong).

## Minimum-you-need-to-know — server

The smallest viable server is a struct with a `tool_router` field, one
`#[tool]` method in a `#[tool_router]` block, and a `#[tool_handler]
impl ServerHandler`:

```rust
use rmcp::{
    ErrorData as McpError, ServerHandler, ServiceExt,
    handler::server::router::tool::ToolRouter,
    model::{CallToolResult, ContentBlock},
    tool, tool_handler, tool_router,
    transport::stdio,
};

#[derive(Clone)]
struct Hello {
    tool_router: ToolRouter<Hello>,
}

#[tool_router]
impl Hello {
    fn new() -> Self {
        Self { tool_router: Self::tool_router() }
    }

    #[tool(description = "Health check.")]
    async fn ping(&self) -> Result<CallToolResult, McpError> {
        Ok(CallToolResult::success(vec![ContentBlock::text("pong")]))
    }
}

#[tool_handler]
impl ServerHandler for Hello {}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    Hello::new().serve(stdio()).await?.waiting().await?;
    Ok(())
}
```

The router field name (`tool_router`) is the **macro default**; rename
it and you'll need to pass the new name to both `#[tool_router]` and
`#[tool_handler]`. The same applies to `prompt_router` and the
`processor` field that `#[task_handler]` reads.

When you add prompts, resources, or tasks, all the handler attributes
**must target the same `impl ServerHandler` block**:

```rust
#[tool_handler]
#[prompt_handler]
#[task_handler]
impl ServerHandler for Server { /* ... */ }
```

Splitting them across multiple `impl` blocks is a compile error because
each macro synthesizes a different subset of `ServerHandler`'s methods.
The full annotated form is in `crates/mcp-server/src/lib.rs:62-93` —
read it. `references/rust-sdk/server/getting-started.md` walks through
the composition step by step.

## Minimum-you-need-to-know — client

The smallest viable client is even shorter — `ClientHandler` has a
default implementation for `()` and `ClientInfo`, so the stub is one
line:

```rust
use rmcp::{ClientHandler, ServiceExt, model::CallToolRequestParams};
use rmcp::model::{ClientRequest, Request, ServerResult};

#[derive(Default, Clone)]
struct MyClient;
impl ClientHandler for MyClient {}

// Connect to any transport — for tests this is `tokio::io::duplex`,
// for production it's a subprocess or `StreamableHttpClientTransport`.
let client = MyClient.serve(transport).await?;

let response = client
    .send_request(ClientRequest::CallToolRequest(Request::new(
        CallToolRequestParams::new("ping"),
    )))
    .await?;

let ServerResult::CallToolResult(result) = response else {
    panic!("expected CallToolResult, got {response:?}");
};
```

The reason this matters: every test in `crates/mcp-server/tests/` uses
this exact harness pattern (with `tokio::io::duplex` as the transport)
to drive the server from inside the same process. It's the cheapest way
to write integration tests for any MCP server. See
`references/rust-sdk/client/testing.md`.

If you need to advertise client capabilities (so the server can ask the
user to elicit input, or sample the LLM, or list roots), override
`get_info()`:

```rust
use rmcp::model::{ClientCapabilities, ClientInfo, Implementation};

impl ClientHandler for MyClient {
    fn get_info(&self) -> ClientInfo {
        ClientInfo::new(
            ClientCapabilities::builder().enable_elicitation().build(),
            Implementation::from_build_env(),
        )
    }
}
```

And override the corresponding callback (`create_elicitation`,
`create_message`, `list_roots`) to respond to those requests. The default
`create_elicitation` automatically declines, which is what
`crates/mcp-server/tests/elicitation.rs` relies on.

## Reference files

The reference set is split into shared topics, server features, and
client features. Read the index at `references/rust-sdk/doc-index.md`
for a one-line summary of every file. Quick map below:

### Shared

| File                                   | Read when                                                                                                  |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `references/rust-sdk/feature-flags.md` | Picking Cargo features, debugging missing-feature compile errors, choosing the right `reqwest` TLS variant |
| `references/rust-sdk/migration-2.2.md` | Upgrading from `rmcp` 2.0 or reviewing the protocol and transport fixes in 2.1 and 2.2                    |

### Server features

| File                                            | Read when                                                                                                                               |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `references/rust-sdk/server/getting-started.md` | Composing `Server` with multiple routers; the stacked-handler-macros rule                                                               |
| `references/rust-sdk/server/tools.md`           | Authoring `#[tool]` methods, `Parameters<T>`, `CallToolResult`, `task_support`, `annotations(...)` (declare or get default-destructive) |
| `references/rust-sdk/server/prompts.md`         | `#[prompt_router]`, multi-arg prompt examples, `Role`                                                                                   |
| `references/rust-sdk/server/resources.md`       | Static resources, URI templates, why there's no macro router for resources                                                              |
| `references/rust-sdk/server/tasks.md`           | SEP-1686 task lifecycle, `OperationProcessor`, the `list_tasks` override pattern                                                        |
| `references/rust-sdk/server/sampling.md`        | `ctx.peer.create_message(...)`, multimodal content handling                                                                             |
| `references/rust-sdk/server/elicitation.md`     | `ctx.peer.elicit::<T>(...)`, `elicit_safe!`, the `ElicitationError` variants                                                            |
| `references/rust-sdk/server/roots.md`           | `ctx.peer.list_roots()` for workspace-aware servers                                                                                     |
| `references/rust-sdk/server/transports.md`      | stdio and Streamable HTTP wiring, `StreamableHttpService` + `LocalSessionManager`                                                       |

### Client features

| File                                            | Read when                                                                                |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `references/rust-sdk/client/getting-started.md` | Smallest viable `ClientHandler`, the `ServiceExt::serve` lifecycle                       |
| `references/rust-sdk/client/handler.md`         | Full `ClientHandler` method list, `ClientCapabilities` builder, notification callbacks   |
| `references/rust-sdk/client/requests.md`        | Sending `ClientRequest::*`, pattern-matching `ServerResult::*`, the untagged-enum gotcha |
| `references/rust-sdk/client/sampling.md`        | Overriding `create_message` to satisfy a server's sampling request                       |
| `references/rust-sdk/client/elicitation.md`     | Overriding `create_elicitation`, `ElicitationAction`, form vs URL elicitation            |
| `references/rust-sdk/client/roots.md`           | Overriding `list_roots` to expose workspace/filesystem roots                             |
| `references/rust-sdk/client/transports.md`      | Child-process transport, Streamable HTTP client (reqwest), in-memory duplex              |
| `references/rust-sdk/client/testing.md`         | The `tokio::io::duplex` harness — the standard way to unit-test an MCP server            |

## Going further than this section

For end-to-end runnable examples beyond what `crates/mcp-server/` covers
(OAuth servers, completion, structured output, progress notifications,
subprocess-launching clients, OAuth client-credentials flows), browse the
[official rust-sdk examples](https://github.com/modelcontextprotocol/rust-sdk/tree/main/examples).
Each example's `Cargo.toml` declares exactly the feature set it needs, which
is itself a useful reference when you're not sure what to enable.
