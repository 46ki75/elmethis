# Client: getting started

A `rmcp` client is anything that implements the `ClientHandler` trait
and gets handed to `ServiceExt::serve(transport)`. The trait has a
default for every method, so the minimum useful client is essentially
a `struct` with `Default` and `Clone` derives.

## When to read this

- Writing your first `rmcp` client (production or test).
- A client should drive an existing MCP server (subprocess, local
  binary, remote HTTP).
- You're integrating the in-memory `tokio::io::duplex` test harness
  pattern.

The smallest in-repo example is `crates/mcp-server/tests/tools.rs` —
a real round-tripped client that sends `ListToolsRequest` and
`CallToolRequest` to the local server.

## The smallest viable client

```rust
use rmcp::{ClientHandler, ServiceExt};

#[derive(Default, Clone)]
struct MyClient;

impl ClientHandler for MyClient {}
```

That's it. `ClientHandler` has default implementations for every
method, so an empty `impl` block is enough.

To drive a transport, hand the client to `ServiceExt::serve`:

```rust
use rmcp::{
    ClientHandler, ServiceExt,
    model::{CallToolRequestParams, ClientRequest, Request, ServerResult},
};

let client_service = MyClient.serve(transport).await?;

let response = client_service
    .send_request(ClientRequest::CallToolRequest(Request::new(
        CallToolRequestParams::new("ping"),
    )))
    .await?;

let ServerResult::CallToolResult(result) = response else {
    panic!("expected CallToolResult, got {response:?}");
};
```

Then `client_service.cancel().await` cleans up when you're done.

## `ServiceExt::serve` returns `RunningService<RoleClient, _>`

The return type is a `RunningService<RoleClient, MyClient>`. It owns
the spawned message loop and exposes:

| Method                                        | What it does                                                       |
| --------------------------------------------- | ------------------------------------------------------------------ |
| `.send_request(ClientRequest)`                | Send a typed `ClientRequest` and await the matching `ServerResult` |
| `.send_notification(ClientNotification)`      | Fire-and-forget notification                                       |
| `.peer()`                                     | Get a `Peer<RoleServer>` for raw outgoing calls                    |
| `.peer_info()`                                | The `ServerInfo` returned during `initialize`                      |
| `.waiting()`                                  | Block until the service ends                                       |
| `.cancel()`                                   | Gracefully stop the service                                        |
| `.call_tool(...)` / `.list_tools(...)` / etc. | Convenience wrappers that skip the `send_request` boilerplate      |
| `.list_all_tools()` / `.list_all_resources()` | Drain pagination automatically                                     |

Use the convenience methods (`.call_tool(...)`) when you can — they
type-thread the response so you don't have to pattern-match
`ServerResult`. Drop down to `send_request` only when you need a
request variant that doesn't have a wrapper, or when you want to assert
on the variant explicitly (as in tests).

## Advertising client capabilities

The default `get_info()` returns `ClientInfo::default()`, which has no
capabilities set. To declare elicitation, sampling, or roots support,
override `get_info`:

```rust
use rmcp::{
    ClientHandler,
    model::{ClientCapabilities, ClientInfo, Implementation},
};

#[derive(Default, Clone)]
struct MyClient;

impl ClientHandler for MyClient {
    fn get_info(&self) -> ClientInfo {
        ClientInfo::new(
            ClientCapabilities::builder()
                .enable_sampling()
                .enable_elicitation()
                .enable_roots()
                .build(),
            Implementation::from_build_env(),
        )
    }
}
```

Declaring a capability is the gate that lets the server *make* the
corresponding request. You still need to override the matching
`ClientHandler` method (`create_message`, `create_elicitation`,
`list_roots`) to actually answer it. The default behavior:

| Method               | Default behavior                                                    |
| -------------------- | ------------------------------------------------------------------- |
| `create_message`     | Returns `method_not_found` — must override if `sampling` is enabled |
| `create_elicitation` | Returns `ElicitationAction::Decline` with no content                |
| `list_roots`         | Returns an empty `ListRootsResult`                                  |

So the bare-minimum client that *declines* every elicitation request is
already correct without an override — the test at
`crates/mcp-server/tests/elicitation.rs::DecliningClient` relies on
this exact behavior.

## `ClientHandler` is implemented for `()` and `ClientInfo`

Two convenience impls let you skip the struct entirely:

- **`impl ClientHandler for ()`** — a no-op client with default info.
  Useful for "just talk to the server" scripts.
- **`impl ClientHandler for ClientInfo`** — uses the given `ClientInfo`
  as the value `get_info()` returns. The streamable HTTP client
  example at
  `submodules/mcp-rust-sdk/examples/clients/src/streamable_http.rs`
  uses this:

  ```rust
  let client_info = ClientInfo::new(
      ClientCapabilities::default(),
      Implementation::new("test client", "0.0.1"),
  );
  let client = client_info.serve(transport).await?;
  ```

Reach for the struct pattern when you need to override callbacks (e.g.
to back a server's sampling/elicitation requests) or when you need
internal state.

## Transports

The transport is whatever implements `IntoTransport<RoleClient, ...>`:

| Transport                              | Built from                                                                                           |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| stdio subprocess (`TokioChildProcess`) | `rmcp::transport::TokioChildProcess::new(Command::new(...).configure(                                |
| Streamable HTTP                        | `StreamableHttpClientTransport::from_uri("http://...")` (`transport-streamable-http-client-reqwest`) |
| In-memory duplex (tests)               | `tokio::io::duplex(4096)` — pass one half to the server and the other to the client                  |
| Custom `(AsyncRead, AsyncWrite)`       | Any pair that implements `AsyncRead + AsyncWrite` (`transport-async-rw`)                             |

See `references/rust-sdk/client/transports.md` for the wiring details of each.

## Lifecycle

```text
client.serve(transport).await?       // initialize handshake
client.send_request(...).await?      // run as long as you need
// ...
client.cancel().await?               // graceful shutdown
```

`.serve(...)` runs the JSON-RPC `initialize` handshake. If it succeeds
you get a live `RunningService`. If the server rejects initialization
(version mismatch, capability conflict), you get an error.

`.waiting()` blocks until the service ends. Use it in production
binaries to keep the process alive; use `.cancel()` in tests to tear
the service down explicitly.

## See also

- `references/rust-sdk/client/handler.md` — every method on `ClientHandler` and
  what overriding it does
- `references/rust-sdk/client/requests.md` — sending typed requests and matching
  on `ServerResult`
- `references/rust-sdk/client/testing.md` — the in-memory duplex test harness
- `references/rust-sdk/client/transports.md` — production transports
- `crates/mcp-server/tests/tools.rs` — smallest runnable in-repo
  example
