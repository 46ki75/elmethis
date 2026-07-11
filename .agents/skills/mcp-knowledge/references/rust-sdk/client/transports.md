# Client: transports

A client picks a transport based on where the server lives:

| Server location                  | Transport                                                                                         |
| -------------------------------- | ------------------------------------------------------------------------------------------------- |
| Subprocess on the same host      | `TokioChildProcess` (`transport-child-process`)                                                   |
| Remote / network                 | `StreamableHttpClientTransport` (`transport-streamable-http-client-reqwest`)                      |
| Unix socket on the same host     | `StreamableHttpClientTransport` over Unix socket (`transport-streamable-http-client-unix-socket`) |
| Inside the same process (tests)  | One half of `tokio::io::duplex(...)`                                                              |
| Custom `(AsyncRead, AsyncWrite)` | Anything implementing `IntoTransport<RoleClient, ...>` (`transport-async-rw`)                     |

## stdio subprocess (`transport-child-process`)

The most common production client transport: launch a server binary as
a subprocess and pipe its stdin/stdout. The helper is
`rmcp::transport::TokioChildProcess`.

```rust
use rmcp::{
    ServiceExt,
    transport::{ConfigureCommandExt, TokioChildProcess},
};
use tokio::process::Command;

let client = ()
    .serve(TokioChildProcess::new(Command::new("npx").configure(
        |cmd| {
            cmd.arg("-y").arg("@modelcontextprotocol/server-everything");
        },
    ))?)
    .await?;
```

`Command::new(bin).configure(|cmd| { cmd.arg(...); })` is sugar from
the `ConfigureCommandExt` trait — it threads the command builder
through a closure so you can keep the call site one expression. Plain
`Command` works too:

```rust
let mut cmd = Command::new("./target/release/mcp-server-stdio");
let transport = TokioChildProcess::new(cmd)?;
let client = ().serve(transport).await?;
```

### When the binary path isn't known statically

Use `which_command` (gated behind the `which-command` feature) to
resolve a binary name to a path cross-platform. It returns a
`tokio::process::Command` pointing at the resolved executable, which you
then configure and hand to `TokioChildProcess::new`:

```rust
use rmcp::transport::{which_command, ConfigureCommandExt, TokioChildProcess};

let cmd = which_command("python")?.configure(|cmd| {
    cmd.arg("-m").arg("my_mcp_server");
});
let transport = TokioChildProcess::new(cmd)?;
```

## Streamable HTTP (`transport-streamable-http-client-reqwest`)

For network servers. The transport is built from a URI:

```rust
use rmcp::{
    ServiceExt,
    model::{ClientCapabilities, ClientInfo, Implementation},
    transport::StreamableHttpClientTransport,
};

let transport = StreamableHttpClientTransport::from_uri("http://localhost:8000/mcp");

let client_info = ClientInfo::new(
    ClientCapabilities::default(),
    Implementation::new("test-client", "0.0.1"),
);
let client = client_info.serve(transport).await?;

let tools = client.list_tools(Default::default()).await?;
println!("{tools:#?}");
```

Note that `ClientInfo` implements `ClientHandler` (see
`references/rust-sdk/client/handler.md`), so you can pass it directly to
`.serve(...)` for a "just talk to the server" client.

### Picking a TLS strategy

Choose one of `reqwest`, `reqwest-native-tls`, or
`reqwest-tls-no-provider` in your `Cargo.toml`. They're mutually
exclusive — see `references/rust-sdk/feature-flags.md`.

### Custom headers / auth

`StreamableHttpClientTransport` accepts a configured `reqwest::Client`
via `StreamableHttpClientTransport::from_client(reqwest_client, "...")`.
Use this to inject `Authorization`, `User-Agent`, custom timeouts, or
cookie support. Production clients almost always want this rather than
`from_uri`.

## Unix socket (`transport-streamable-http-client-unix-socket`)

For talking to a server bound to a Unix domain socket on the same
host. Uses `hyper` rather than `reqwest`:

```rust
use rmcp::transport::UnixSocketHttpClient;

let transport = UnixSocketHttpClient::new("/run/myserver.sock", "/mcp");
let client = ().serve(transport).await?;
```

Mostly relevant for daemon-style deployments where the server runs as
a system service.

## In-memory duplex (tests)

Skip the network entirely:

```rust
let (server_transport, client_transport) = tokio::io::duplex(4096);
let server_handle = tokio::spawn(async move {
    let service = MyServer::new().serve(server_transport).await?;
    service.waiting().await?;
    anyhow::Ok(())
});
let client = TestClient.serve(client_transport).await?;
// ... drive the server ...
client.cancel().await?;
let _ = server_handle.await;
```

This is *the* canonical test harness — every test in
`crates/mcp-server/tests/` uses it. The buffer (`4096`) is just the
backpressure threshold; it's not a message-size limit. See
`references/rust-sdk/client/testing.md` for more.

## `IntoTransport` and BYO transport

Any `(impl AsyncRead, impl AsyncWrite)` pair implements
`IntoTransport<RoleClient, ...>` when the `transport-async-rw` feature
is on (which is the default for `client`). So you can plug in:

- A TCP socket — `tokio::net::TcpStream::split()` gives you the two
  halves.
- A web-socket library that produces `AsyncRead`/`AsyncWrite` adapters.
- A test mock — any pair you wire up by hand.

The `Sink` / `Stream` variant is also supported via
`IntoTransport<RoleClient, _, Sink + Stream>` — used by the streamable
HTTP transport internally.

## Choosing in one line

| Goal                                 | Reach for                                                               |
| ------------------------------------ | ----------------------------------------------------------------------- |
| Drive a local MCP server binary      | `TokioChildProcess` (`transport-child-process`)                         |
| Drive a remote MCP server over HTTPS | `StreamableHttpClientTransport` with `reqwest` TLS feature              |
| Drive a system-daemon MCP server     | `UnixSocketHttpClient` (`transport-streamable-http-client-unix-socket`) |
| Unit-test a local server             | `tokio::io::duplex(4096)`                                               |

## Gotchas

### Subprocess stderr is *your* problem

`TokioChildProcess` only pipes stdin/stdout. The child's stderr
inherits from the parent by default. If your subprocess logs to stderr,
that output will appear interleaved with your client's logs unless you
explicitly redirect it (`.stderr(Stdio::piped())` and consume it).

### HTTPS to `localhost` needs care

`localhost` doesn't have a public certificate. For development, point
at `http://localhost:...` (no TLS) or use a self-signed cert with
`reqwest::ClientBuilder::danger_accept_invalid_certs(true)` — set
that on the client you pass to `from_client`.

### Don't `serve` twice

`ServiceExt::serve(transport)` consumes the transport. If you need to
reconnect after a failure, build a new transport and call `.serve(...)`
again.

## See also

- `references/rust-sdk/feature-flags.md` — exact feature flags for each transport
- `references/rust-sdk/server/transports.md` — corresponding server-side wiring
- `references/rust-sdk/client/testing.md` — duplex transport in detail
- `submodules/mcp-rust-sdk/examples/clients/src/everything_stdio.rs`
  — subprocess client driving the JS reference server
- `submodules/mcp-rust-sdk/examples/clients/src/streamable_http.rs`
  — HTTP client
