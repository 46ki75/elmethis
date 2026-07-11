# Client: testing MCP servers with `tokio::io::duplex`

The canonical way to unit-test an MCP server is to drive it from a
client inside the same process, with a `tokio::io::duplex(...)` pair
as the transport. No subprocess, no network — just two `AsyncRead`/
`AsyncWrite` halves piped between server and client.

Every test in `crates/mcp-server/tests/` uses this pattern. It's *the*
shape for testing any MCP-related Rust code.

## When to read this

- Writing integration tests for a server.
- Reproducing a server bug from a known client interaction.
- Exercising the server's `tools/*`, `prompts/*`, `resources/*`,
  `tasks/*` flows without setting up subprocesses or HTTP.

## The harness

```rust
use rmcp::{ClientHandler, ServiceExt};

#[derive(Default, Clone)]
struct TestClient;
impl ClientHandler for TestClient {}

#[tokio::test]
async fn smoke() -> anyhow::Result<()> {
    let (server_transport, client_transport) = tokio::io::duplex(4096);

    let server_handle = tokio::spawn(async move {
        let service = MyServer::new().serve(server_transport).await?;
        service.waiting().await?;
        anyhow::Ok(())
    });

    let client = TestClient.serve(client_transport).await?;

    // ... assertions go here ...

    client.cancel().await?;
    let _ = server_handle.await;
    Ok(())
}
```

Three moving parts:

1. **`tokio::io::duplex(buffer)`** — returns a pair of duplex streams.
   Whatever the server writes to its half, the client reads on its
   half, and vice versa.
2. **`tokio::spawn(...)`** — the server lives on a background task. It
   does `serve(server_transport).await?` (initialize handshake), then
   `.waiting().await?` (run the message loop) until the client
   disconnects.
3. **`TestClient.serve(client_transport).await?`** — the client
   initializes against the same in-memory channel. The `.serve` call
   completes once the JSON-RPC `initialize` handshake succeeds.

When the test is done, `client.cancel()` closes the client end, which
makes the server's `.waiting()` future complete, which makes the
spawned task return, which `_ = server_handle.await` joins cleanly.

## A complete worked test

```rust
use mcp_server::Server;
use rmcp::{
    ClientHandler, ServiceExt,
    model::{
        CallToolRequestParams, ClientRequest, ContentBlock, ListToolsRequest, Request,
        ServerResult,
    },
};

#[derive(Default, Clone)]
struct TestClient;
impl ClientHandler for TestClient {}

#[tokio::test]
async fn list_tools_returns_the_advertised_set() -> anyhow::Result<()> {
    let (server_transport, client_transport) = tokio::io::duplex(4096);
    let server_handle = tokio::spawn(async move {
        let service = Server::new().serve(server_transport).await?;
        service.waiting().await?;
        anyhow::Ok(())
    });
    let client = TestClient.serve(client_transport).await?;

    let response = client
        .send_request(ClientRequest::ListToolsRequest(ListToolsRequest::default()))
        .await?;
    let ServerResult::ListToolsResult(listed) = response else {
        panic!("expected ListToolsResult, got {response:?}");
    };

    let mut names: Vec<&str> = listed.tools.iter().map(|t| t.name.as_ref()).collect();
    names.sort();
    assert_eq!(names, vec!["ping", "slow_count"]);

    client.cancel().await?;
    let _ = server_handle.await;
    Ok(())
}
```

(Sample taken from `crates/mcp-server/tests/tools.rs`.)

## Helper: extracting text content

`ContentBlock` is a flat, non-generic enum (`Text | Image | Audio |
Resource | ResourceLink`) — no more `Annotated<RawContent>` wrapper, so
there's no `.raw` indirection. A tiny helper keeps the test bodies clean:

```rust
fn first_text(content: &[ContentBlock]) -> Option<&str> {
    content.iter().find_map(|c| match c {
        ContentBlock::Text(t) => Some(t.text.as_str()),
        _ => None,
    })
}
```

This appears verbatim in
`crates/mcp-server/tests/tools.rs::first_text` and
`crates/mcp-server/tests/elicitation.rs::first_text`.

## Polling for state

For task tests, the server completes work in the background — you have
to poll until the desired state appears. Don't `tokio::time::sleep(...)`
a fixed duration; it's slow and flaky. Use a bounded polling loop:

```rust
use std::time::Duration;
use rmcp::{
    RoleClient,
    model::{ClientRequest, ListTasksRequest, ServerResult, TaskStatus},
    service::RunningService,
};

async fn wait_for_task_status(
    client: &RunningService<RoleClient, TestClient>,
    task_id: &str,
    target: TaskStatus,
    within: Duration,
) -> anyhow::Result<()> {
    tokio::time::timeout(within, async {
        loop {
            let tasks = client
                .send_request(ClientRequest::ListTasksRequest(ListTasksRequest::default()))
                .await?;
            let ServerResult::ListTasksResult(listed) = tasks else {
                anyhow::bail!("expected ListTasksResult, got {tasks:?}");
            };
            if listed
                .tasks
                .iter()
                .any(|t| t.task_id == task_id && t.status == target)
            {
                return anyhow::Ok(());
            }
            tokio::time::sleep(Duration::from_millis(20)).await;
        }
    })
    .await
    .map_err(|_| anyhow::anyhow!("task {task_id} did not reach {target:?} within {within:?}"))?
}
```

(From `crates/mcp-server/tests/task.rs:30-56`.)

Use a 5-second timeout for tests that wait on running tasks. The inner
poll delay (`20ms`) is short enough that the test reacts almost
instantly when the state arrives.

## Capability negotiation in tests

If your test exercises a server feature that needs a client capability
(elicitation, sampling, roots), declare it in the test client's
`get_info()`. The simplest "always declines" elicitation client is
literally:

```rust
#[derive(Default, Clone)]
struct DecliningClient;

impl ClientHandler for DecliningClient {
    fn get_info(&self) -> ClientInfo {
        ClientInfo::new(
            ClientCapabilities::builder().enable_elicitation().build(),
            Implementation::from_build_env(),
        )
    }
}
```

Default `create_elicitation` already returns `Decline`, so the test
needs no override. See
`crates/mcp-server/tests/elicitation.rs`.

For a test that needs to *accept* elicitation with canned content,
override `create_elicitation`:

```rust
async fn create_elicitation(
    &self,
    _params: ElicitRequestParams,
    _ctx: RequestContext<RoleClient>,
) -> Result<ElicitResult, ErrorData> {
    Ok(ElicitResult::new(ElicitationAction::Accept)
        .with_content(serde_json::json!({ "name": "Test User" })))
}
```

## Sending raw `ClientRequest::*` vs convenience methods

Tests typically use `send_request(ClientRequest::*)` rather than
`client.call_tool(...)` so the test can pattern-match on the *exact*
`ServerResult` variant. Production code should prefer the convenience
methods.

When a request can ambiguously deserialize (e.g.
`CancelTaskResult` vs `GetTaskResult` — see
`references/rust-sdk/client/requests.md`), accept either variant:

```rust
let task = match cancel_response {
    ServerResult::CancelTaskResult(r) => r.task,
    ServerResult::GetTaskResult(r) => r.task,
    other => panic!("expected cancel/get task result, got {other:?}"),
};
```

## Gotchas

### `cancel().await` doesn't always join the spawned task

The pattern `let _ = server_handle.await;` after `client.cancel()` is
there to actually wait for the server task to finish, not just to
trigger its shutdown. Without it, the test may finish before the
server's logging or drop logic runs — fine in most cases, but it can
mask resource-leak bugs.

### Buffer too small => stall

`tokio::io::duplex(4096)` gives 4 KB of in-memory buffer per direction.
That's plenty for normal MCP messages, but if a single response is
larger (large `tools/list` result, big resource body) and the reader
isn't draining, you can deadlock. Bump to `64 * 1024` if you see a
stall on a big response.

### Tests can run in parallel

`cargo test` runs integration tests concurrently by default. Each
duplex pair is process-local, so there's no cross-test interference —
no need to serialize tests against a global resource.

## See also

- `references/rust-sdk/client/getting-started.md` — the smallest viable client
- `references/rust-sdk/client/requests.md` — building `ClientRequest::*`
- `references/rust-sdk/client/transports.md` — production transport choices
- `crates/mcp-server/tests/tools.rs` — list / call / typed args
- `crates/mcp-server/tests/prompts.rs` — `GetPromptRequest`
- `crates/mcp-server/tests/resources.rs` — list / read / template / error
- `crates/mcp-server/tests/elicitation.rs` — `DecliningClient` + capability declaration
- `crates/mcp-server/tests/task.rs` — polling, cancellation, completion
