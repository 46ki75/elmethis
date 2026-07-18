# Migrating rmcp 2.0 to 2.2

This guide targets `rmcp` 2.2.0. The 2.1 and 2.2 releases are compatible
with the 2.0 public server API, so a normal upgrade is a manifest and
verification change rather than a source rewrite. Check the 2.0 migration
first if the project still uses pre-2.0 model types.

## Upgrade the dependency

Raise the minimum compatible version and refresh the lockfile:

```toml
rmcp = { version = "2.2.0", features = [
    "server",
    "macros",
    "transport-io",
    "transport-streamable-http-server",
] }
```

Keep only the features the project actually uses. Add `client` for an
in-process client test harness and `elicitation` for typed
`Peer::elicit::<T>()` calls. The workspace example at
`crates/mcp-server/` uses both because its integration tests drive the
server through `tokio::io::duplex`.

## Check the 2.0 model migration

`rmcp` 2.0 aligned model types with MCP 2025-11-25. It changed many public
model structs from field literals into non-exhaustive types constructed with
`::new(...)` and configured through `.with_*(...)` builders. In particular,
review direct construction of `Resource`, `ResourceTemplate`, content blocks,
task types, request parameter types, and `CallToolResult`.

Prefer these forms:

```rust
let resource = Resource::new("mem://status", "status".to_string());
let result = CallToolResult::success(vec![ContentBlock::text("ok")]);
let params = CallToolRequestParams::new("status").with_arguments(arguments);
```

Do not add fields to a struct literal just to satisfy a compiler error. The
constructor and builder API preserves forward compatibility when the protocol
adds fields.

## Protocol-version negotiation in 2.1

`rmcp` 2.1 fixes default `ServerHandler` negotiation. During initialization,
the handler now echoes a client-requested protocol version when it is known;
otherwise it falls back to the protocol version returned from `get_info()`.

For a normal server, keep the default `initialize` implementation and set a
fallback in `get_info()`:

```rust
ServerInfo::new(capabilities)
    .with_protocol_version(ProtocolVersion::LATEST)
```

Only override `initialize` for deliberate compatibility policy or extra
initialization work. A replacement must preserve the SDK's negotiation and
peer-info setup, or later handlers can observe the wrong negotiated version.

For Streamable HTTP, the SDK validates `MCP-Protocol-Version` against the
initialization body's `protocolVersion`. Clients must send matching values
when they send the header. Test an older supported client version as well as
the default latest version.

## Cancellation and Streamable HTTP in 2.1 and 2.2

Version 2.1 makes `AsyncRwTransport::receive` cancel-safe. Version 2.2 stops
responses after a request is cancelled and fails orphaned Streamable HTTP
responses when a session is reinitialized. These are SDK behavior fixes, not
new handler methods.

Application code should still cooperate with cancellation:

- Do not cache or reuse a request's response path after its cancellation
  token fires.
- Make long-running work task-capable when clients need cancellation or
  polling; see `references/rust-sdk/server/tasks.md`.
- On Streamable HTTP session replacement, discard application state tied to
  the old request or response stream.
- Use a `CancellationToken` in `StreamableHttpServerConfig` and connect it to
  the web server's graceful shutdown path.

## Validate the upgrade

1. Run `cargo check --all-targets` and fix direct model literals using the
   2.0 constructors and builders.
2. Run the package test suite, including `tokio::io::duplex` tests that make
   tool, prompt, and resource requests.
3. Exercise a task-capable tool both synchronously and with task metadata;
   cancel a running task if the server exposes tasks.
4. Run the stdio binary with stderr-only logging and verify the initialize,
   tools/list, and tools/call path.
5. Run the Streamable HTTP binary and test initialization with matching
   `MCP-Protocol-Version` and body protocol versions, then reconnect or
   reinitialize to ensure old responses are not retained.

## Sources

- `rmcp` 2.2.0 release source, commit
  `519577601db3823616dbd7c4eb84ed569d8e17d4`
- `references/rust-sdk/overview.md` for feature selection and known limits
- `references/rust-sdk/server/transports.md` for stdio and Streamable HTTP
- `crates/mcp-server/` for a runnable 2.2 server and integration tests
