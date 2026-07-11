# Server: roots

**Roots** are the server-to-client request `roots/list`: the server
asks the client what filesystem/workspace roots it has exposed (IDE
project paths, sandbox directories, etc.). Servers use roots to scope
file lookups, restrict search, or render context-aware UIs.

> **Deprecated by SEP-2577.** As of rmcp 2.0, roots' types and methods
> (`Root`, `ListRootsResult`, `Peer::list_roots`, etc.) carry
> `#[deprecated]` — a compiler warning, not a hard error. They remain
> fully functional and are still part of the protocol. Call sites that
> keep using them (like `list_workspace_roots` below) wrap the call in
> `#[allow(deprecated, reason = "...")]`; mirror that pattern in your
> own code.

## When to read this

- Writing a tool that needs to know where the user's project lives.
- Working with an IDE-integrated MCP client and want to surface its
  open folders.

The canonical local example is `list_workspace_roots` in
`crates/mcp-server/src/tools.rs:179-209`.

## The minimum roots-using tool

```rust
use rmcp::{
    ErrorData as McpError, RoleServer,
    model::{CallToolResult, ContentBlock},
    service::RequestContext,
    tool,
};

#[allow(deprecated, reason = "SEP-2577 deprecates roots; kept as an example")]
#[tool(description = "List the workspace roots the client has exposed.")]
async fn list_workspace_roots(
    &self,
    ctx: RequestContext<RoleServer>,
) -> Result<CallToolResult, McpError> {
    let result = ctx.peer.list_roots().await.map_err(|e| {
        McpError::internal_error(format!("roots/list request failed: {e}"), None)
    })?;

    let text = if result.roots.is_empty() {
        "Client exposed no roots.".to_string()
    } else {
        result
            .roots
            .iter()
            .map(|root| match &root.name {
                Some(name) => format!("- {} ({})", name, root.uri),
                None => format!("- {}", root.uri),
            })
            .collect::<Vec<_>>()
            .join("\n")
    };
    Ok(CallToolResult::success(vec![ContentBlock::text(text)]))
}
```

## `Root` shape

A `Root` has two fields:

| Field  | Type             | Meaning                                                 |
| ------ | ---------------- | ------------------------------------------------------- |
| `uri`  | `String`         | The root URI, typically `file:///path/to/dir`           |
| `name` | `Option<String>` | Human-readable label (often the folder name in the IDE) |

Don't assume `name` is set. Always fall back to `uri` if it's not.

## Required client capability

The client must advertise `roots` in its `ClientCapabilities`. If it
hasn't, `ctx.peer.list_roots()` returns an error. As with
elicitation/sampling, you can either:

- bubble the error up as `internal_error`, or
- check the error and degrade gracefully (e.g. "no roots — please open
  a folder in your IDE").

The capability is two-tiered:

| Capability                                     | Meaning                                                  |
| ---------------------------------------------- | -------------------------------------------------------- |
| `ClientCapabilities::builder().enable_roots()` | Client supports `roots/list`                             |
| `.enable_roots_list_changed()`                 | Client will also send `roots/list_changed` notifications |

If your server cares about live changes (e.g. you want to re-scan when
the user opens a new folder), implement
`ServerHandler::on_roots_list_changed` *or* handle the equivalent on
the client → server notification path.

## Empty roots is normal

A client may legitimately expose zero roots:

- The user hasn't opened a folder yet (IDE).
- The client is a chat UI that doesn't have a filesystem concept.
- The user revoked permissions.

The `list_workspace_roots` example handles this explicitly by emitting
`"Client exposed no roots."` rather than failing.

## Pagination

`roots/list` does not support pagination in the current spec — the
client returns everything in one response. Don't assume you can iterate.

## Capability declaration on the server side

Like sampling and elicitation, the server doesn't need to advertise
anything special to *make* `roots/list` requests. The gate is the
client's `ClientCapabilities::roots` field.

## See also

- `references/rust-sdk/server/tools.md` — `RequestContext<RoleServer>` as a tool
  parameter
- `references/rust-sdk/server/sampling.md`,
  `references/rust-sdk/server/elicitation.md` — sibling server-to-client requests
- `references/rust-sdk/client/roots.md` — implementing the client side
- `crates/mcp-server/src/tools.rs:179-209` — `list_workspace_roots`
  worked example
