# Server: getting started

Compose a `Server` struct from one or more routers, wire them together
on a single `impl ServerHandler` block, and serve over a transport.

## When to read this

- You're building your first `rmcp` server.
- You added a second router (prompts after tools, tasks after prompts)
  and ran into a macro / `impl` conflict.
- You renamed `tool_router` / `prompt_router` / `processor` and the
  macro now can't find the field.

The canonical local example is `crates/mcp-server/src/lib.rs`. Read it
end-to-end before this file if you prefer code-first orientation.

## The minimum server

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

`#[tool_router]` on an `impl` block:

1. Scans the block for methods marked `#[tool(...)]`.
2. Generates `fn tool_router() -> ToolRouter<Self>` so you can
   initialize the field.
3. Generates the `ToolRouter<Self>` value that wires those methods to
   the JSON-RPC dispatcher.

`#[tool_handler]` on `impl ServerHandler` reads `self.tool_router` and
auto-implements `ServerHandler::list_tools` and `call_tool`.

## Adding more routers

When you go beyond tools — prompts, resources, tasks — the structure
grows but the rules stay the same. The full shape from
`crates/mcp-server/src/lib.rs:34-61`:

```rust
use std::sync::Arc;
use rmcp::{
    handler::server::router::{prompt::PromptRouter, tool::ToolRouter},
    task_manager::OperationProcessor,
};
use tokio::sync::Mutex;

#[derive(Clone)]
pub struct Server {
    #[allow(dead_code, reason = "read by the #[tool_handler] macro")]
    tool_router: ToolRouter<Server>,
    #[allow(dead_code, reason = "read by the #[prompt_handler] macro")]
    prompt_router: PromptRouter<Server>,
    pub(crate) processor: Arc<Mutex<OperationProcessor>>,
}

impl Server {
    pub fn new() -> Self {
        Self {
            tool_router: Self::tool_router(),
            prompt_router: Self::prompt_router(),
            processor: Arc::new(Mutex::new(OperationProcessor::new())),
        }
    }
}
```

The field names are the **macro defaults**:

| Macro               | Default field it reads | Override                                      |
| ------------------- | ---------------------- | --------------------------------------------- |
| `#[tool_handler]`   | `tool_router`          | `#[tool_handler(router = self.my_tools)]`     |
| `#[prompt_handler]` | `prompt_router`        | `#[prompt_handler(router = self.my_prompts)]` |
| `#[task_handler]`   | `processor`            | `#[task_handler(processor = self.task_proc)]` |

The `Clone` bound is required by `#[task_handler]` — it captures
`self` into spawned futures. Make sure any internal state lives behind
`Arc` / `Mutex` so cloning is cheap.

## The stacked-handler rule

This is the one thing that bites every newcomer. All three handler
attributes must target the **same** `impl ServerHandler` block:

```rust
#[tool_handler]
#[prompt_handler]
#[task_handler]
impl ServerHandler for Server {
    // any manual overrides go here
}
```

Why: each macro synthesizes a different subset of `ServerHandler`'s
methods. Putting them on separate `impl ServerHandler for Server`
blocks would mean re-implementing the trait multiple times for the same
type, which Rust forbids.

If you need to manually override one of the methods a macro synthesizes
(e.g. `list_tasks` to merge in completed tasks), add the override to
the same `impl` block. The macro skips methods you've defined yourself.
See `crates/mcp-server/src/lib.rs:120-129` for the `list_tasks`
override.

## Resources are different

Resources are **not** macro-routed. `rmcp` doesn't ship a
`#[resource_router]`. The path is to implement `list_resources`,
`read_resource`, and `list_resource_templates` directly on the
`ServerHandler` impl, typically by delegating to free functions:

```rust
async fn list_resources(
    &self,
    _request: Option<PaginatedRequestParams>,
    _ctx: RequestContext<RoleServer>,
) -> Result<ListResourcesResult, McpError> {
    Ok(resources::list_resources(self))
}
```

See `references/rust-sdk/server/resources.md` for the full pattern.

## Serving the result

`ServiceExt::serve(transport)` wraps your `Server` in a
`RunningService<RoleServer, Server>` and starts the message loop.
`.waiting()` blocks until the transport closes or the service is
cancelled. For the streamable HTTP transport, the equivalent is the
axum integration shown in `crates/mcp-server/src/bin/http.rs:32-47` —
see `references/rust-sdk/server/transports.md`.

## Capability advertisement and instructions

The default `get_info()` returns a minimal `ServerInfo`. Override it to
declare capabilities, set a protocol version, or include human-readable
instructions:

```rust
fn get_info(&self) -> ServerInfo {
    ServerInfo::new(
        ServerCapabilities::builder()
            .enable_tools()
            .enable_prompts()
            .enable_resources()
            .enable_tasks()
            .build(),
    )
    .with_server_info(Implementation::from_build_env())
    .with_protocol_version(ProtocolVersion::LATEST)
    .with_instructions("Replace these example handlers with real ones.")
}
```

`Implementation::from_build_env()` picks up `CARGO_PKG_NAME` and
`CARGO_PKG_VERSION`. The `ServerCapabilities::builder()` toggles are
typestate — each `enable_*` returns a builder with a different
const-generic flag set; just call `.build()` when you're done.

## See also

- `references/rust-sdk/server/tools.md` — `#[tool]`, `Parameters<T>`,
  `CallToolResult` shape
- `references/rust-sdk/server/prompts.md` — `#[prompt]`, message roles
- `references/rust-sdk/server/resources.md` — free-function dispatch, templates
- `references/rust-sdk/server/tasks.md` — `#[task_handler]`, the
  `OperationProcessor` and the `list_tasks` override
- `references/rust-sdk/server/transports.md` — stdio and Streamable HTTP wiring
- `crates/mcp-server/src/lib.rs` — full canonical example
