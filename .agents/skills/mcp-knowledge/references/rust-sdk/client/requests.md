# Client: sending requests

A client drives a server by sending JSON-RPC requests and matching on
the responses. `rmcp` exposes this via the `RunningService` returned
from `ServiceExt::serve(transport)`.

## When to read this

- Calling a tool, fetching a resource, listing prompts, etc.
- Tests that assert on the exact `ServerResult` variant.
- You hit the `CancelTaskResult` vs `GetTaskResult` deserialization
  ambiguity.

## Two ways to send requests

### Convenience methods on `RunningService`

The fastest path is the typed convenience methods:

```rust
// List
let tools = client.list_tools(Default::default()).await?;
let resources = client.list_resources(Default::default()).await?;
let prompts = client.list_prompts(Default::default()).await?;

// Auto-paginate
let all_tools = client.list_all_tools().await?;
let all_resources = client.list_all_resources().await?;

// Calls
use rmcp::model::CallToolRequestParams;

let result = client
    .call_tool(
        CallToolRequestParams::new("echo")
            .with_arguments(rmcp::object!({ "message": "hi" })),
    )
    .await?;

let prompt = client
    .get_prompt(
        rmcp::model::GetPromptRequestParams::new("echo")
            .with_arguments(/* serde_json::Map<String, Value> */),
    )
    .await?;

let res = client
    .read_resource(rmcp::model::ReadResourceRequestParams::new("mem://example"))
    .await?;
```

These return the typed result directly, so there's no enum
pattern-matching. Use them in production code.

The `rmcp::object!` macro is a small helper that produces a
`serde_json::Map<String, Value>` — useful for tool arguments without
declaring a struct.

### Raw `send_request` for explicit variants

When you need the wire-level enum (most often in tests, where you want
to assert on the exact variant), build a `ClientRequest` and call
`send_request`:

```rust
use rmcp::model::{
    CallToolRequestParams, ClientRequest, Request, ServerResult,
};

let response = client
    .send_request(ClientRequest::CallToolRequest(Request::new(
        CallToolRequestParams::new("ping"),
    )))
    .await?;

let ServerResult::CallToolResult(result) = response else {
    panic!("expected CallToolResult, got {response:?}");
};
```

`Request::new(params)` wraps the params in a `Request<Method, Params>`
shape carrying the method-name marker type and the params. The convert
to `ClientRequest::*` is done by the enum variants you choose.

## `ClientRequest` variant map

| Variant                        | Params type                      | Convenience method on `RunningService`         |
| ------------------------------ | -------------------------------- | ---------------------------------------------- |
| `InitializeRequest`            | `InitializeRequestParams`        | (auto, during `.serve(...)`)                   |
| `PingRequest`                  | (no params)                      | `.ping()`                                      |
| `ListResourcesRequest`         | `Option<PaginatedRequestParams>` | `.list_resources(...)`                         |
| `ListResourceTemplatesRequest` | `Option<PaginatedRequestParams>` | `.list_resource_templates(...)`                |
| `ReadResourceRequest`          | `ReadResourceRequestParams`      | `.read_resource(...)`                          |
| `ListPromptsRequest`           | `Option<PaginatedRequestParams>` | `.list_prompts(...)`                           |
| `GetPromptRequest`             | `GetPromptRequestParams`         | `.get_prompt(...)`                             |
| `ListToolsRequest`             | `Option<PaginatedRequestParams>` | `.list_tools(...)`                             |
| `CallToolRequest`              | `CallToolRequestParams`          | `.call_tool(...)`                              |
| `CompleteRequest`              | `CompleteRequestParams`          | `.complete(...)`                               |
| `SetLevelRequest`              | `SetLevelRequestParams`          | `.set_level(...)`                              |
| `SubscribeRequest`             | `SubscribeRequestParams`         | `.subscribe(...)`                              |
| `UnsubscribeRequest`           | `UnsubscribeRequestParams`       | `.unsubscribe(...)`                            |
| `ListTasksRequest`             | `Option<PaginatedRequestParams>` | (raw `send_request`)                           |
| `GetTaskRequest`               | `GetTaskParams`                  | (raw `send_request`)                           |
| `GetTaskPayloadRequest`        | `GetTaskPayloadParams`           | (raw `send_request`)                           |
| `CancelTaskRequest`            | `CancelTaskParams`               | (raw `send_request`)                           |
| `CustomRequest`                | arbitrary JSON                   | (raw `send_request`)                           |

There's no separate "enqueue task" request variant — invoking a tool as a
task is `CallToolRequest` (or `.call_tool(...)`) with
`CallToolRequestParams::with_task(TaskMetadata::new())` set. The server
replies with `ServerResult::CreateTaskResult` instead of
`ServerResult::CallToolResult`.

`GetTaskPayloadRequest` / `GetTaskPayloadParams` were named
`GetTaskResultRequest` / `GetTaskResultParams` before rmcp 2.0; the old
names are kept as deprecated aliases.

Exact variant names live in `model.rs` — `grep -n "pub enum ClientRequest"
submodules/mcp-rust-sdk/crates/rmcp/src/model.rs` if you need the
authoritative list.

## Matching on `ServerResult`

`send_request` returns a `ServerResult` enum (`ServerResult::*`):

```rust
match response {
    ServerResult::CallToolResult(r) => { /* r is CallToolResult */ },
    ServerResult::ListToolsResult(r) => { /* r is ListToolsResult */ },
    ServerResult::ReadResourceResult(r) => { /* ... */ },
    /* ... */
    other => panic!("unexpected: {other:?}"),
}
```

In the (rare) cases where the variant doesn't match the request you
sent, you've likely:

1. Hit the **untagged enum gotcha** (next section), or
2. Sent a request the server doesn't support — it returned a
   protocol-level error instead, which `send_request` would have
   surfaced as `Err(...)`, not `Ok(ServerResult::*)`.

## The untagged-enum gotcha (cancel vs get task)

`ServerResult` deserializes via `#[serde(untagged)]`. Variants are
tried in declaration order, so when two variants share the same wire
shape, `serde` picks the first match.

The known case is **`CancelTaskResult` vs `GetTaskResult`**: both
serialize as `{ task: Task, _meta: Option<Meta> }` (a result shape plus
a `task` field), and `GetTaskResult` is listed first in the enum. So a
`tasks/cancel` response *may* deserialize as `ServerResult::GetTaskResult`
even though the server intended to send `CancelTaskResult`.

The fix: accept either:

```rust
let response = client
    .send_request(ClientRequest::CancelTaskRequest(Request::new(
        CancelTaskParams::new(task_id.clone()),
    )))
    .await?;

let task = match response {
    ServerResult::CancelTaskResult(r) => r.task,
    ServerResult::GetTaskResult(r) => r.task,
    other => panic!("expected cancel/get task result, got {other:?}"),
};
assert_eq!(task.status, TaskStatus::Cancelled);
```

`CancelTaskParams` is `#[non_exhaustive]`, so build it with
`CancelTaskParams::new(task_id)` rather than a struct literal — the
latter no longer compiles from outside the `rmcp` crate.

`crates/mcp-server/tests/task.rs::list_tasks_reports_cancelled_status_for_cancelled_task`
shows this in practice. If you see a test failing on
`expected CancelTaskResult got GetTaskResult`, this is why.

## Cancellation tokens

`send_request` cancels cleanly when the caller's future is dropped —
the underlying transport receives a `cancelled` notification. For
explicit cancellation (e.g. timing out a slow tool), wrap the call:

```rust
let response = tokio::time::timeout(
    std::time::Duration::from_secs(5),
    client.send_request(/* ... */),
)
.await??;
```

## Notifications

Send a fire-and-forget notification via `send_notification`:

```rust
use rmcp::model::{ClientNotification, Notification, ProgressNotificationParam};

client
    .send_notification(ClientNotification::ProgressNotification(
        Notification::new(ProgressNotificationParam::new(progress_token, 0.5)),
    ))
    .await?;
```

`ProgressNotificationParam` is `#[non_exhaustive]` — build it with
`::new(progress_token, progress)` plus `.with_total(...)` /
`.with_message(...)`, not a struct literal.

There's no response and no `await` for the server's reply.

## See also

- `references/rust-sdk/client/handler.md` — what the server can request from the
  client
- `references/rust-sdk/server/tasks.md` — the server side of the
  `CancelTaskResult` / `GetTaskResult` ambiguity
- `references/rust-sdk/client/testing.md` — full test-harness pattern using
  `send_request`
- `crates/mcp-server/tests/task.rs` — `CancelTaskParams`,
  `ListTasksRequest`, polling-with-timeout
- `submodules/mcp-rust-sdk/examples/clients/src/everything_stdio.rs`
  — convenience methods (`call_tool`, `list_all_tools`, etc.)
