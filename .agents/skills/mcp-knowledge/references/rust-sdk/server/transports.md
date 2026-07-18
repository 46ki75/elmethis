# Server: transports

A server only needs one transport to be useful, but `rmcp` supports
several and the wiring differs significantly between them. This file
covers stdio and Streamable HTTP — the two production transports — and
points at the in-memory `tokio::io::duplex` pattern used by every test
in `crates/mcp-server/tests/`.

## When to read this

- Picking how a server should talk to its client.
- Wiring a Streamable HTTP server (axum, tower) for the first time.
- Setting up graceful shutdown.

The canonical local examples are `crates/mcp-server/src/bin/stdio.rs`
and `crates/mcp-server/src/bin/http.rs`.

## stdio (`transport-io` feature)

`rmcp::transport::stdio()` returns a `(Stdin, Stdout)` tuple, which
implements `IntoTransport<RoleServer, ...>`. Pass it to
`ServiceExt::serve(...)`:

```rust
use rmcp::{ServiceExt, transport::stdio};
use tracing_subscriber::EnvFilter;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::fmt()
        .with_env_filter(
            EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info")),
        )
        .with_writer(std::io::stderr)
        .with_ansi(false)
        .init();

    tracing::info!("starting MCP server over stdio");

    let service = Server::new().serve(stdio()).await.inspect_err(|e| {
        tracing::error!(error = ?e, "failed to start MCP server");
    })?;

    service.waiting().await?;
    Ok(())
}
```

Key points:

- **Log to stderr, not stdout.** JSON-RPC frames go on stdout; any
  byte that isn't a valid frame corrupts the stream. The
  `tracing_subscriber::fmt().with_writer(std::io::stderr)` line above
  is load-bearing.
- **Disable ANSI escapes** (`.with_ansi(false)`). Many MCP clients
  capture stderr too and won't render ANSI codes.
- **`service.waiting().await`** blocks until the transport closes
  (client disconnects) or the service is cancelled. Without it, `main`
  exits immediately.

## Streamable HTTP (`transport-streamable-http-server` feature)

`StreamableHttpService` is a `tower::Service` that handles a single
HTTP endpoint (typically `/mcp`). Compose it into an `axum::Router`:

```rust
use rmcp::transport::streamable_http_server::{
    StreamableHttpServerConfig, StreamableHttpService,
    session::local::LocalSessionManager,
};
use tracing_subscriber::EnvFilter;

const DEFAULT_BIND_ADDRESS: &str = "127.0.0.1:8000";

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::fmt()
        .with_env_filter(
            EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info")),
        )
        .init();

    let bind_address =
        std::env::var("MCP_BIND_ADDRESS").unwrap_or_else(|_| DEFAULT_BIND_ADDRESS.to_string());

    let cancellation = tokio_util::sync::CancellationToken::new();

    let service = StreamableHttpService::new(
        || Ok(Server::new()),
        LocalSessionManager::default().into(),
        StreamableHttpServerConfig::default()
            .with_cancellation_token(cancellation.child_token()),
    );

    let router = axum::Router::new().nest_service("/mcp", service);
    let listener = tokio::net::TcpListener::bind(&bind_address).await?;
    tracing::info!(%bind_address, "MCP server listening at /mcp");

    axum::serve(listener, router)
        .with_graceful_shutdown(async move {
            let _ = tokio::signal::ctrl_c().await;
            cancellation.cancel();
        })
        .await?;

    Ok(())
}
```

Anatomy:

1. **Factory closure** — `|| Ok(Server::new())` is called once per
   session. If you need per-session state (a session-scoped cache,
   per-user auth context), construct it here.
2. **`LocalSessionManager`** — in-memory session store. For multi-node
   deployments you'd implement the `SessionManager` trait against an
   external store (Redis, DB).
3. **`StreamableHttpServerConfig`** — knobs for streaming, JSON
   responses, cancellation. The defaults are sensible.
4. **Routing** — `nest_service("/mcp", service)` mounts the MCP
   endpoint. The exact path is up to you; clients are configured with
   the full URL.
5. **Graceful shutdown** — Wire a `CancellationToken` from the config
   into axum's `with_graceful_shutdown`. On `Ctrl+C`, cancel the token
   so in-flight requests can drain.

### `rmcp` 2.1 and 2.2 behavior

The default `ServerHandler::initialize` now negotiates a known client
protocol version and uses the server's configured version only as a fallback.
Keep a sensible fallback such as `ProtocolVersion::LATEST` in `get_info()`;
do not duplicate the negotiation in a custom `initialize` implementation
unless you need custom compatibility policy.

`rmcp` 2.2 also fails orphaned Streamable HTTP responses when a session is
reinitialized and avoids responding to a cancelled request. Treat a client
reinitialize or cancellation as terminal for the old request: do not retain
response senders or attempt a second response in application code.

## When to use which

| Transport                | Use when                                                           |
| ------------------------ | ------------------------------------------------------------------ |
| stdio                    | Local subprocess clients (Claude Desktop, MCP Inspector via stdio) |
| Streamable HTTP          | Remote / network-accessible servers; multiple concurrent clients   |
| Both (separate binaries) | Want development-time stdio (cheap, no port) plus production HTTP  |

The canonical example ships both as separate binaries —
`mcp-server-stdio` and `mcp-server-http` — sharing one `Server`
implementation. Match that pattern when you need transport flexibility.

## In-memory duplex (for tests)

For integration tests, skip the real transport and pipe two ends of a
`tokio::io::duplex` between server and client:

```rust
let (server_transport, client_transport) = tokio::io::duplex(4096);
let server_handle = tokio::spawn(async move {
    let service = Server::new().serve(server_transport).await?;
    service.waiting().await?;
    anyhow::Ok(())
});
let client_service = TestClient.serve(client_transport).await?;
// ... drive the server via client_service.send_request(...).await ...
client_service.cancel().await?;
let _ = server_handle.await;
```

The buffer size (`4096`) only matters for backpressure — it's not the
message size limit. See `references/rust-sdk/client/testing.md` for the full
test-harness pattern.

## Other transports

| Transport                                 | Feature flag                                   | Notes                                                                  |
| ----------------------------------------- | ---------------------------------------------- | ---------------------------------------------------------------------- |
| HTTP+SSE (legacy)                         | `server-side-http`                             | Deprecated by the spec in favor of Streamable HTTP; avoid for new code |
| Unix socket Streamable HTTP (client only) | `transport-streamable-http-client-unix-socket` | Client-side only; for talking to a Unix-domain HTTP server             |

## Gotchas

### Forgetting `with_writer(stderr)` on stdio

Symptoms: client hangs at `initialize` or returns parse errors. Cause:
a stray `println!` or default tracing output is corrupting the JSON-RPC
stream on stdout.

### Cancellation tokens vs Ctrl+C

The pattern above wires a child cancellation token into the
`StreamableHttpServerConfig`. Cancelling the parent token also cancels
the child — that's what makes graceful shutdown work. If you forget to
pass `with_cancellation_token`, the server will keep running after
axum stops accepting connections.

### Session lifetime

`LocalSessionManager` stores sessions in memory. They live as long as
the process does, which means stale sessions accumulate if clients
disconnect without sending a proper close. For long-running servers,
either configure session timeouts via `StreamableHttpServerConfig` or
implement a custom `SessionManager` with TTL.

## See also

- `references/rust-sdk/feature-flags.md` — the transport-* feature matrix
- `references/rust-sdk/client/transports.md` — corresponding client-side wiring
- `references/rust-sdk/client/testing.md` — duplex-transport test pattern
- `references/rust-sdk/migration-2.2.md` — 2.0 to 2.2 upgrade checklist
- `crates/mcp-server/src/bin/stdio.rs` — stdio binary
- `crates/mcp-server/src/bin/http.rs` — Streamable HTTP binary
