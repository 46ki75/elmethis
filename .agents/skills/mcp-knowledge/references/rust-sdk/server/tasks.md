# Server: tasks (SEP-1686)

MCP **tasks** are async, server-side operations: a client calls a tool
with `task` metadata, the server kicks off the work, returns a task
handle immediately, and the client polls `tasks/list`, `tasks/get`,
`tasks/result`, or `tasks/cancel` to drive the lifecycle.

`rmcp` 2.x ships task support behind the `#[task_handler]` macro plus
the `OperationProcessor` runtime in `rmcp::task_manager`.

## When to read this

- A tool genuinely takes more than a few seconds and you want the
  client to be able to walk away and check back.
- You want to support cancellation.
- You're surprised that the default `tasks/list` doesn't show
  completed tasks (it doesn't — see "list_tasks override" below).

The canonical local example is `crates/mcp-server/src/tasks.rs` plus
the `slow_count` tool in `crates/mcp-server/src/tools.rs`.

## Lifecycle in 30 seconds

1. **Server marks a tool task-capable** — `#[tool(..., execution(task_support = "optional" | "required"))]`.
2. **Client calls the tool with `task` metadata** — for an `"optional"`
   tool it can also omit `task` and run synchronously.
3. **Server enqueues the operation** — `#[task_handler]`-synthesized
   `enqueue_task` spawns the tool body via `OperationProcessor` and
   returns a `CreateTaskResult` carrying the new task id.
4. **Client polls** — `tasks/list`, `tasks/get`, `tasks/result`,
   or `tasks/cancel` (also synthesized by `#[task_handler]`).
5. **Task finishes / fails / is cancelled / times out** — result lands
   in the processor's completed queue.

## Wiring the processor into `Server`

```rust
use std::sync::Arc;
use rmcp::task_manager::OperationProcessor;
use tokio::sync::Mutex;

#[derive(Clone)]
pub struct Server {
    tool_router: ToolRouter<Server>,
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

#[tool_handler]
#[prompt_handler]
#[task_handler]
impl ServerHandler for Server { /* ... */ }
```

`#[task_handler]` reads `self.processor` by default. To use a different
field name, pass it: `#[task_handler(processor = self.my_task_proc)]`.

The processor lives behind `Arc<Mutex<...>>` because
`#[task_handler]` clones `Server` into each spawned task and the
processor has interior mutability (`list_running`, `peek_completed`,
`submit_operation` all take `&mut self`).

## Marking a tool task-capable

```rust
#[tool(
    description = "Count up to `target` slowly. Supports task-based invocation.",
    execution(task_support = "optional")
)]
async fn slow_count(
    &self,
    Parameters(args): Parameters<SlowCountArgs>,
) -> Result<CallToolResult, McpError> {
    for i in 1..=args.target {
        tokio::time::sleep(std::time::Duration::from_millis(100)).await;
        tracing::debug!(tick = i, target = args.target, "slow_count tick");
    }
    Ok(CallToolResult::success(vec![ContentBlock::text(
        args.target.to_string(),
    )]))
}
```

`task_support` values:

| Value        | Behavior                                                                                                                   |
| ------------ | -------------------------------------------------------------------------------------------------------------------------- |
| `"optional"` | Client may opt in to the task path by sending `task` metadata, or run sync. Synchronous calls still block until completion |
| `"required"` | Client must send `task` metadata. Synchronous calls are rejected                                                           |
| (omitted)    | Synchronous only. Task metadata is rejected                                                                                |

## What `#[task_handler]` synthesizes

The macro auto-implements these `ServerHandler` methods (one
synthesized method per `tasks/*` JSON-RPC method):

- `enqueue_task` — spawns the tool body onto the processor and returns
  `CreateTaskResult { task_id, ... }`.
- `list_tasks` — returns currently *running* tasks via
  `OperationProcessor::list_running()`.
- `get_task_info` — returns metadata for one task.
- `get_task_result` — drains the completed result for a task id.
- `cancel_task` — signals cancellation via the processor.

Each method validates the underlying tool's `task_support` declaration
and rejects mismatches (sync call to a `"required"` tool, etc.).

## The `list_tasks` gotcha

By default, `tasks/list` only returns *running* tasks. Short tools
vanish from the list as soon as they finish. The canonical fix at
`crates/mcp-server/src/tasks.rs` overrides `list_tasks` to merge in
`peek_completed()`:

```rust
use rmcp::{
    ErrorData as McpError,
    model::{ListTasksResult, Task, TaskStatus},
    task_manager::current_timestamp,
};

pub async fn list_tasks(server: &Server) -> Result<ListTasksResult, McpError> {
    let mut processor = server.processor.lock().await;
    let now = current_timestamp();

    let mut tasks: Vec<Task> = processor
        .list_running()
        .into_iter()
        .map(|task_id| Task::new(task_id, TaskStatus::Working, now.clone(), now.clone()))
        .collect();

    for result in processor.peek_completed() {
        let status = match &result.result {
            Ok(_) => TaskStatus::Completed,
            Err(e) if e.to_string().to_lowercase().contains("cancelled") => {
                TaskStatus::Cancelled
            }
            Err(_) => TaskStatus::Failed,
        };
        tasks.push(Task::new(
            result.descriptor.operation_id.clone(),
            status,
            now.clone(),
            now.clone(),
        ));
    }

    Ok(ListTasksResult::new(tasks))
}
```

Put the override on the same `impl ServerHandler` block as the macros;
the macros skip methods you've defined yourself.

## Distinguishing cancellation from failure

`OperationProcessor::cancel_task` pushes the cancelled result as
`Err(Error::TaskError("Operation cancelled"))`. Timeouts produce
`Err(Error::TaskError("Operation timed out"))`. `TaskResult` does not
yet expose a structured discriminator, so the canonical pattern is to
string-match on the rendered error message:

```rust
let status = match &result.result {
    Ok(_) => TaskStatus::Completed,
    Err(e) if e.to_string().to_lowercase().contains("cancelled") => {
        TaskStatus::Cancelled
    }
    Err(_) => TaskStatus::Failed,
};
```

Timeouts fall through to `Failed`, which matches user intuition. Swap
to a typed discriminator once upstream exposes one.

## Timestamps

`OperationProcessor` does not yet expose per-task `created_at` /
`last_updated_at`. Today the cheapest path is to set both timestamps
to `current_timestamp()` at list time, which makes every task look like
it was just created. This is acknowledged with a doc comment on the
override at `crates/mcp-server/src/tasks.rs:18-24` — keep that comment
in sync with whatever upstream lands.

## Cancellation flow

A client sends `tasks/cancel { task_id }`. The macro-synthesized
`cancel_task` calls `OperationProcessor::cancel_task(...)`, which sets
the task's cancellation flag. The spawned future is expected to be
**cooperative** — it must check the cancellation signal at `.await`
points. `tokio::time::sleep` and `tokio::select!` interact correctly,
but a tight CPU loop will not.

## Result enum ambiguity on the client side

Heads up: `ServerResult::CancelTaskResult` and `ServerResult::GetTaskResult`
share the same wire shape after `serde` flattening, and the untagged
enum may pick the wrong variant when deserializing. Test code that
handles cancellation must accept either:

```rust
let task = match response {
    ServerResult::CancelTaskResult(r) => r.task,
    ServerResult::GetTaskResult(r) => r.task,
    other => panic!("expected cancel/get task result, got {other:?}"),
};
```

See `crates/mcp-server/tests/task.rs::list_tasks_reports_cancelled_status_for_cancelled_task`
for the worked example, and `references/rust-sdk/client/requests.md` for more
on this pattern.

## Capability declaration

Advertise task support:

```rust
ServerCapabilities::builder()
    .enable_tools()
    .enable_tasks()
    /* ... */
    .build()
```

Without `.enable_tasks()`, clients may skip the `tasks/*` methods
entirely.

## Inspector / MCP-spec-incompatible clients

Many clients (including MCP Inspector at the time of writing) do not
opt in to the task path. They will call an `"optional"` task tool
synchronously and wait for the full result, which may hit a request
timeout (`-32001`) if the tool is genuinely slow.

Pick the strategy that matches your tool:

| Tool runtime | Recommended `task_support`                                                   |
| ------------ | ---------------------------------------------------------------------------- |
| < 1 second   | omit — keep it synchronous                                                   |
| 1-10 seconds | `"optional"` — sync clients see "slow but works", task clients see better UX |
| > 10 seconds | `"required"` — sync clients are rejected, forces clients to use tasks        |

## See also

- `references/rust-sdk/server/tools.md` — `execution(task_support = ...)` shape
- `references/rust-sdk/client/requests.md` — the `CancelTaskResult` /
  `GetTaskResult` ambiguity, polling patterns
- `crates/mcp-server/src/tasks.rs` — the `list_tasks` override
- `crates/mcp-server/tests/task.rs` — full lifecycle integration test
