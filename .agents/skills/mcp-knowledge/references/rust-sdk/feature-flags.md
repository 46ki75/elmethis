# Cargo feature flags

Source of truth: `submodules/mcp-rust-sdk/crates/rmcp/Cargo.toml`
(`[features]` section starting at line 115).

The `rmcp` crate is heavily feature-gated because it covers two roles
(client and server), several transports, and optional integrations
(OAuth, TLS, schemars). Defaults give you a server with macros and
base64 image support but **no transports** — you almost always have to
opt in to one.

```toml
# Defaults (line 116 of rmcp/Cargo.toml)
default = ["base64", "macros", "server"]
```

## Quick reference table

The columns are: feature name → what it pulls in → when to enable it.

### Roles

| Feature            | Implies                                            | Enable when                                                                                 |
| ------------------ | -------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `server` (default) | `transport-async-rw`, `dep:schemars`, `dep:pastey` | Writing a server. Re-exports `ServerHandler`, `serve_server`, `RoleServer`                  |
| `client`           | `dep:tokio-stream`                                 | Writing or testing a client. Re-exports `ClientHandler`, `serve_client`, `RoleClient`       |
| `macros` (default) | `dep:rmcp-macros`, `dep:pastey`                    | Using `#[tool]`, `#[tool_router]`, `#[prompt]`, `#[prompt_router]`, `#[task_handler]`, etc. |
| `base64` (default) | —                                                  | Encoding image/binary content in tool results                                               |
| `schemars`         | `dep:schemars`                                     | Stand-alone JSON Schema generation. Implied by `server`                                     |
| `elicitation`      | `dep:url`                                          | Server-side typed elicitation via `Peer::elicit<T>(...)` and the `elicit_safe!` macro       |

### Transports

| Feature                                        | Implies                                                                             | Enable when                                                                    |
| ---------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `transport-async-rw`                           | `tokio/io-util`, `tokio-util/codec`                                                 | Generic `AsyncRead + AsyncWrite` transport. Implied by `server`                |
| `transport-io`                                 | `transport-async-rw`, `tokio/io-std`                                                | stdio transport (`rmcp::transport::stdio()`)                                   |
| `transport-child-process`                      | `transport-async-rw`, `tokio/process`, `dep:process-wrap`                           | Spawn an MCP server as a subprocess and talk to it over stdio                  |
| `which-command`                                | `transport-child-process`, `dep:which`                                              | Resolve a server binary by name (cross-platform `which`)                       |
| `transport-streamable-http-server-session`     | `transport-async-rw`, `dep:tokio-stream`                                            | Lower-level building block; usually pulled in by the next flag                 |
| `transport-streamable-http-server`             | `transport-streamable-http-server-session`, `server-side-http`, `transport-worker`  | Streamable HTTP server (`StreamableHttpService` + axum / tower)                |
| `transport-streamable-http-client`             | `client-side-sse`, `transport-worker`                                               | Base for the streamable HTTP client                                            |
| `transport-streamable-http-client-reqwest`     | `transport-streamable-http-client`, `__reqwest`                                     | Streamable HTTP client with the `reqwest` backend                              |
| `transport-streamable-http-client-unix-socket` | `transport-streamable-http-client`, hyper + bytes + `tokio/net`                     | Streamable HTTP client over a Unix domain socket                               |
| `transport-worker`                             | `dep:tokio-stream`                                                                  | Helper transport that coordinates a worker task                                |
| `client-side-sse`                              | `dep:sse-stream`, `dep:http`                                                        | Parsing SSE responses on the client                                            |
| `server-side-http`                             | `uuid`, `rand`, `tokio-stream`, `http`, `http-body`, `bytes`, `sse-stream`, `tower` | Lower-level HTTP server primitives (implied by the streamable HTTP server)     |
| `tower`                                        | `dep:tower-service`                                                                 | Expose `StreamableHttpService` as a `tower::Service` to plug into axum / hyper |

### HTTP backends — pick exactly one

`reqwest`, `reqwest-native-tls`, and `reqwest-tls-no-provider` are
**mutually exclusive**. They all enable the internal `__reqwest`
feature, but each picks a different TLS strategy:

| Feature                   | TLS strategy                                                    | Use when                                                                                           |
| ------------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `reqwest`                 | `reqwest/rustls` — pure-Rust TLS via rustls                     | **Default recommendation.** Portable, no system OpenSSL dependency                                 |
| `reqwest-native-tls`      | `reqwest/native-tls` — OS-native TLS                            | You need to honor platform certificate stores (Windows SChannel, macOS Keychain, OpenSSL on Linux) |
| `reqwest-tls-no-provider` | `reqwest/rustls-no-provider` — rustls without baked-in provider | You're providing your own `CryptoProvider` (FIPS, OpenSSL-backed rustls, etc.)                     |

Picking more than one is a compile error. Picking none gives you
`reqwest` without TLS, which only works for `http://` URLs.

### Auth

| Feature                       | Implies                              | Enable when                                            |
| ----------------------------- | ------------------------------------ | ------------------------------------------------------ |
| `auth`                        | `dep:oauth2`, `__reqwest`, `dep:url` | OAuth 2.0 client-credentials flows                     |
| `auth-client-credentials-jwt` | `auth`, `dep:jsonwebtoken`, `uuid`   | OAuth 2.0 with `private_key_jwt` client authentication |

### Miscellaneous

| Feature | Implies              | Enable when                                                                          |
| ------- | -------------------- | ------------------------------------------------------------------------------------ |
| `uuid`  | `uuid` crate (v4)    | Generating session IDs. Auto-on with `server-side-http`                              |
| `local` | `rmcp-macros?/local` | Targeting environments without `Send` futures (e.g. WASM). Switches the trait bounds |

## Choosing a starter set

| You're building...                                           | Recommended features                                                                                                                                                        |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A simple stdio server                                        | `["server", "macros", "transport-io"]`                                                                                                                                      |
| A stdio + Streamable HTTP server (like `crates/mcp-server/`) | `["server", "client", "macros", "transport-io", "transport-streamable-http-server", "schemars", "elicitation"]`                                                             |
| A subprocess client (driving an existing MCP server)         | `["client", "transport-child-process"]`                                                                                                                                     |
| A Streamable HTTP client                                     | `["client", "transport-streamable-http-client-reqwest", "reqwest"]`                                                                                                         |
| A test crate that drives a server over in-memory duplex      | `["server", "client", "macros"]` — duplex transport needs no extra features (it's just `AsyncRead + AsyncWrite` and goes through `transport-async-rw`, implied by `server`) |
| An OAuth-protected HTTP server                               | `["server", "macros", "transport-streamable-http-server", "auth"]` plus a `reqwest*` flag                                                                                   |

## Common compile errors and what they mean

- **`cannot find macro #[tool_router] in this scope`** — you didn't
  enable `macros` (or you enabled `client` only, since `macros` is gated
  behind `feature = "macros"` plus `feature = "server"` in the re-export
  at `crates/rmcp/src/lib.rs:33`).
- **`unresolved import rmcp::transport::stdio`** — you didn't enable
  `transport-io`. The function is gated behind that feature.
- **`unresolved import rmcp::transport::StreamableHttpService`** — you
  didn't enable `transport-streamable-http-server`.
- **`cannot find macro elicit_safe! in scope`** — you didn't enable
  `elicitation`. The macro and the `ElicitationError` enum are both
  gated behind that feature flag (see
  `submodules/mcp-rust-sdk/crates/rmcp/src/service/server.rs:451`).
- **`expected struct rmcp::model::ClientCapabilities, found ...`** when
  building a `ClientInfo` from `ClientCapabilities::builder().build()`
  — the builder state encodes which `enable_*` methods were called via
  const generics. Just call `.build()` immediately; you do not need to
  store the intermediate builder type.

## Workspace example

The local workspace at `crates/mcp-server/Cargo.toml` consumes `rmcp`
via the workspace dependency at `Cargo.toml:50-58`. That set is a good
starting point for any server that needs more than just stdio.
