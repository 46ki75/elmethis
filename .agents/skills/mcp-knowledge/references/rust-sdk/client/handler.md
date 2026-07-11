# Client: the `ClientHandler` trait

`ClientHandler` is the trait every `rmcp` client implements. Every
method has a default, so you only override what you actually need to
answer.

Trait source: `submodules/mcp-rust-sdk/crates/rmcp/src/handler/client.rs`
(starting at line 89).

## When to read this

- You're overriding a callback and want to know the signature.
- You need the full list of notification callbacks a client receives.
- You're debugging "method not found" or "elicitation declined"
  responses and want to know what the defaults do.

## Method catalog

### Server-to-client *requests* (server asks the client to do something)

These come from `ServerRequest::*` and the client must respond.

| Method                                                                         | Default                           | Capability gate | When to override                           |
| ------------------------------------------------------------------------------ | --------------------------------- | --------------- | ------------------------------------------ |
| `ping(ctx) -> Result<(), McpError>`                                            | Returns `Ok(())`                  | none            | Almost never                               |
| `create_message(params, ctx) -> Result<CreateMessageResult, McpError>`         | Returns `method_not_found`        | `sampling`      | Whenever sampling is enabled               |
| `list_roots(ctx) -> Result<ListRootsResult, McpError>`                         | Returns empty `ListRootsResult`   | `roots`         | When the client exposes folders            |
| `create_elicitation(params, ctx) -> Result<ElicitResult, McpError>`            | Returns `Decline` with no content | `elicitation`   | Whenever you want to actually ask the user |
| `on_custom_request(req, ctx) -> Result<CustomResult, McpError>`                | Returns `method_not_found`        | none            | Handling protocol extensions               |

### Server-to-client *notifications* (server tells the client about something)

These are fire-and-forget — the client doesn't reply. Returning from
the method is enough.

| Method                                                  | Default | When to override                                                     |
| ------------------------------------------------------- | ------- | -------------------------------------------------------------------- |
| `on_cancelled(params, ctx)`                             | no-op   | Surface "operation cancelled" to the user                            |
| `on_progress(params, ctx)`                              | no-op   | Update a progress bar                                                |
| `on_logging_message(params, ctx)`                       | no-op   | Forward server logs into your logging system                         |
| `on_resource_updated(params, ctx)`                      | no-op   | Invalidate a cache, re-fetch a resource                              |
| `on_resource_list_changed(ctx)`                         | no-op   | Re-list resources                                                    |
| `on_tool_list_changed(ctx)`                             | no-op   | Re-list tools                                                        |
| `on_prompt_list_changed(ctx)`                           | no-op   | Re-list prompts                                                      |
| `on_url_elicitation_notification_complete(params, ctx)` | no-op   | Continue a URL-based elicitation flow once the user finishes the URL |
| `on_task_status(params, ctx)`                           | no-op   | Track task (SEP-1319) status changes pushed from the server          |
| `on_custom_notification(notification, ctx)`             | no-op   | Handle protocol extensions                                           |

### Initialization

| Method       | Default                 | When to override                                                  |
| ------------ | ----------------------- | ----------------------------------------------------------------- |
| `get_info()` | `ClientInfo::default()` | Always when you want to declare capabilities or identify yourself |

## `ClientInfo` and `ClientCapabilities`

`ClientInfo::new(capabilities, implementation)` builds the value
returned by `get_info()`. `ClientCapabilities::builder()` lets you
opt in to client-side features:

```rust
use rmcp::model::{ClientCapabilities, ClientInfo, Implementation};

ClientInfo::new(
    ClientCapabilities::builder()
        .enable_experimental()
        .enable_roots()
        .enable_roots_list_changed()
        .enable_sampling()
        .enable_elicitation()
        .build(),
    Implementation::from_build_env(),
)
```

Builder methods (from
`submodules/mcp-rust-sdk/crates/rmcp/src/model/capabilities.rs`):

| Method                                    | Sets                                                  |
| ----------------------------------------- | ----------------------------------------------------- |
| `.enable_experimental()`                  | `experimental` capability marker (no fields)          |
| `.enable_roots()`                         | `roots: Some(RootsCapabilities::default())`           |
| `.enable_roots_list_changed()`            | `roots.list_changed = Some(true)`                     |
| `.enable_sampling()`                      | `sampling: Some(SamplingCapability::default())`       |
| `.enable_sampling_tools()`                | `sampling.tools = Some(true)` (SEP-1330)              |
| `.enable_sampling_context()`              | `sampling.context = Some(true)` (SEP-1577)            |
| `.enable_elicitation()`                   | `elicitation: Some(ElicitationCapability::default())` |
| `.enable_elicitation_schema_validation()` | `elicitation.schema_validation = Some(true)`          |
| `.enable_tasks()`                         | `tasks: Some(TasksCapability::default())`             |

`Implementation::from_build_env()` reads `CARGO_PKG_NAME` and
`CARGO_PKG_VERSION` and uses them as the client identity. For a
hand-written name/version, use `Implementation::new("my-client", "0.1.0")`.

## `RequestContext<RoleClient>` and `NotificationContext<RoleClient>`

Every request and notification handler takes a context as its last
parameter. The two most useful fields:

- `ctx.peer` — the `Peer<RoleServer>` you can use to make outgoing
  calls to the server. Useful inside `create_message` if you want to
  call a tool before answering.
- `ctx.request_id` (request contexts) — the JSON-RPC request id, useful
  for tracing.

## The blanket `Service<RoleClient>` impl

`ClientHandler` is wired into the JSON-RPC machinery via a blanket
`impl Service<RoleClient> for H: ClientHandler` at the top of
`handler/client.rs`. You don't need to know about `Service<R>` to write
a client — the blanket impl pattern-matches `ServerRequest` /
`ServerNotification` and dispatches to the trait methods.

## Wrapper impls

`ClientHandler` is also implemented for `Box<T: ClientHandler>` and
`Arc<T: ClientHandler>`, so you can stash clients in collections
without erasing the type. For full dynamic dispatch use the
`DynService<R>` trait surfaced via `ServiceExt::into_dyn`.

## Special-case impls

| Type         | `get_info()` returns    | `create_message` returns | `list_roots` returns | `create_elicitation` returns |
| ------------ | ----------------------- | ------------------------ | -------------------- | ---------------------------- |
| `()`         | `ClientInfo::default()` | `method_not_found`       | empty                | `Decline`                    |
| `ClientInfo` | the value itself        | `method_not_found`       | empty                | `Decline`                    |

These are intentional shortcuts for "I just want to talk to a server"
clients (`()`) and "I just want to advertise capabilities" clients
(`ClientInfo`).

## See also

- `references/rust-sdk/client/getting-started.md` — full minimum example
- `references/rust-sdk/client/sampling.md`,
  `references/rust-sdk/client/elicitation.md`,
  `references/rust-sdk/client/roots.md` — per-callback deep dives
- `submodules/mcp-rust-sdk/crates/rmcp/src/handler/client.rs` — full
  trait source
- `submodules/mcp-rust-sdk/crates/rmcp/src/model/capabilities.rs` —
  `ClientCapabilities` builder source
