# Server: elicitation

**Elicitation** is the server-to-client request `elicitation/create`:
the server asks the user (via the client) for typed input mid-tool.
`rmcp` exposes a typed wrapper via `Peer::elicit<T>(...)` plus the
`rmcp::elicit_safe!` macro to mark input types as schema-safe.

The `elicitation` Cargo feature must be enabled for both the macro and
the `ElicitationError` enum to be in scope.

## When to read this

- Writing a tool that needs a piece of user info (name, choice,
  confirmation) that isn't already in the tool's arguments.
- A tool you wrote is surfacing user-decline as `internal_error` — see
  the gotcha below; this is the most common elicitation bug.
- You want to register a custom struct for elicitation.

The canonical local example is `greet_user` in
`crates/mcp-server/src/tools.rs:130-177`, with the regression test at
`crates/mcp-server/tests/elicitation.rs`.

## The minimum elicitation tool

```rust
use rmcp::{
    ErrorData as McpError, RoleServer,
    model::{CallToolResult, ContentBlock},
    service::{ElicitationError, RequestContext},
    tool, schemars,
};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, schemars::JsonSchema)]
pub struct UserNameInput {
    /// The user's preferred display name.
    pub name: String,
}

rmcp::elicit_safe!(UserNameInput);

#[tool(description = "Ask the user for their name, then greet them.")]
async fn greet_user(
    &self,
    ctx: RequestContext<RoleServer>,
) -> Result<CallToolResult, McpError> {
    match ctx
        .peer
        .elicit::<UserNameInput>("Please enter your name")
        .await
    {
        Ok(Some(input)) => Ok(CallToolResult::success(vec![ContentBlock::text(format!(
            "Hello, {}!",
            input.name
        ))])),
        Ok(None) => Ok(CallToolResult::success(vec![ContentBlock::text(
            "Greeting skipped — no name was provided.",
        )])),
        Err(ElicitationError::UserDeclined) => Ok(CallToolResult::success(vec![
            ContentBlock::text("Greeting skipped — the user declined to share their name."),
        ])),
        Err(ElicitationError::UserCancelled) => Ok(CallToolResult::success(vec![
            ContentBlock::text("Greeting cancelled — the user dismissed the prompt."),
        ])),
        Err(ElicitationError::CapabilityNotSupported) => Ok(CallToolResult::success(vec![
            ContentBlock::text(
                "This client does not support elicitation, so the user could not be \
                 prompted for a name.",
            ),
        ])),
        Err(e) => Err(McpError::internal_error(
            format!("elicitation failed: {e}"),
            None,
        )),
    }
}
```

## `elicit_safe!` and why it exists

`Peer::elicit<T>(...)` requires `T: ElicitationSafe` (and `JsonSchema +
DeserializeOwned`). The `ElicitationSafe` marker trait exists so that
the input type compiles to a JSON Schema **of type `"object"`** — MCP
clients expect structured form data, not bare primitives or arrays.

`rmcp::elicit_safe!(MyStruct);` is the canonical way to opt your type
in. Don't `impl ElicitationSafe for MyStruct` by hand; the macro is
short for that and intentionally makes the gate visible:

```rust
#[derive(Serialize, Deserialize, schemars::JsonSchema)]
pub struct ConfirmInput {
    pub confirmed: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub reason: Option<String>,
}
rmcp::elicit_safe!(ConfirmInput);
```

Calling `elicit::<String>("Name?")` will not compile — it's a primitive,
not an object.

## The `ElicitationError` variants — the must-handle list

`ctx.peer.elicit::<T>(prompt)` returns
`Result<Option<T>, ElicitationError>`. The full variant list (from
`submodules/mcp-rust-sdk/crates/rmcp/src/service/server.rs:495-530`):

| Variant                           | Cause                                                                          | Surface as                                                        |
| --------------------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| `Ok(Some(input))`                 | User submitted valid data matching `T`                                         | `CallToolResult::success(...)` happy path                         |
| `Ok(None)`                        | The client returned `Accept` with no content                                   | `CallToolResult::success(...)` skipped path                       |
| `Err(UserDeclined)`               | User explicitly clicked "Reject" / "Decline" / "No"                            | `CallToolResult::success(...)` — user action, not failure         |
| `Err(UserCancelled)`              | User dismissed the dialog (Escape, close, click outside)                       | `CallToolResult::success(...)` — user action, not failure         |
| `Err(CapabilityNotSupported)`     | Client did not declare `elicitation` in its `ClientCapabilities`               | `CallToolResult::success(...)` — capability mismatch, not failure |
| `Err(NoContent)`                  | Client sent `Accept` but content was missing (protocol bug on the client side) | `Err(McpError::internal_error(...))`                              |
| `Err(ParseError { error, data })` | The user's input didn't deserialize to `T`                                     | `Err(McpError::internal_error(...))` or retry                     |
| `Err(Service(_))`                 | Underlying JSON-RPC / transport failure                                        | `Err(McpError::internal_error(...))`                              |

**The most common bug is treating `UserDeclined` / `UserCancelled` /
`CapabilityNotSupported` as service failures and bubbling them up as
`internal_error`.** Those are user actions or capability mismatches —
the *tool ran successfully and the user said no*. Return
`CallToolResult::success(...)` with an informative message so the client
can render it naturally. The regression test at
`crates/mcp-server/tests/elicitation.rs` locks this contract in.

## Required client capability

The client must advertise `elicitation` during `initialize`. If it
didn't, `ctx.peer.elicit(...)` returns
`Err(ElicitationError::CapabilityNotSupported)`.

For a client *test* harness that needs to back the server's elicitation
calls, override `ClientHandler::create_elicitation` and declare the
capability via `ClientCapabilities::builder().enable_elicitation()` —
see `references/rust-sdk/client/elicitation.md`.

## Form vs URL elicitation

The 2025-11-25 MCP spec adds URL-based elicitation: instead of
collecting fields inline, the server tells the client to open a URL.
`rmcp` represents this as the `UrlElicitationParams` variant of
`ElicitRequestParams` (see
`submodules/mcp-rust-sdk/crates/rmcp/src/model.rs:2743-2809`).
`CreateElicitationRequestParams` is now a deprecated type alias for
`ElicitRequestParams` — update any code still importing the old name.

The typed `Peer::elicit<T>` helper covers the form path. For URL
elicitation, construct the lower-level `ElicitRequest`
(`CreateElicitationRequest` is now a deprecated alias for it) and send
it via `ctx.peer.send_request(...)` directly. The upstream example
`submodules/mcp-rust-sdk/examples/servers/src/elicitation_stdio.rs`
demonstrates both flavors.

## Multi-step elicitation

If you need to gather a sequence of inputs (e.g. confirm, then provide
details), make multiple `elicit` calls in sequence. Each one is a
separate `elicitation/create` round trip; the client may render them
back-to-back or merge them in its UI.

## Capability declaration on the server side

You do **not** need to advertise anything special in
`ServerCapabilities` for the server to *make* elicitation requests —
the gate is the client's `ClientCapabilities::elicitation` field. The
server side only needs the `elicitation` Cargo feature enabled (so the
macro and error enum compile).

## Gotchas

### `ParseError` happens when the client returns malformed JSON

The client is supposed to validate the form input against
`requested_schema` before sending it back. Some clients don't, or
validate weakly. If you start seeing `ParseError`, either tighten
schema validation on the client end or accept a more permissive `T` and
re-validate inside the tool.

### `elicit_safe!` is not auto-derived

You must call the macro on every type you want to elicit. There's no
`#[derive(ElicitationSafe)]`.

### Don't pre-fill sensitive fields in the schema

`JsonSchema` doc-comments end up in the schema and are shown to the
user. Don't put secrets, tokens, or PII in field doc-comments.

## See also

- `references/rust-sdk/server/tools.md` — `RequestContext<RoleServer>` as a tool
  parameter
- `references/rust-sdk/server/sampling.md` — the sibling server-to-client
  request for LLM output
- `references/rust-sdk/server/roots.md` — the sibling server-to-client request
  for workspace listing
- `references/rust-sdk/client/elicitation.md` — implementing the client side
- `crates/mcp-server/src/tools.rs:130-177` — `greet_user` worked example
- `crates/mcp-server/tests/elicitation.rs` — regression test locking
  in the "decline is graceful" contract
- `submodules/mcp-rust-sdk/examples/servers/src/elicitation_stdio.rs`
  and `elicitation_enum_inference.rs` — upstream examples
