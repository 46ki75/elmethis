# Client: sampling (`create_message`)

> **SEP-2577 deprecation.** As of rmcp 2.0, sampling types and methods
> (`CreateMessageRequestParams`, `CreateMessageResult`, `SamplingMessage`,
> `Peer::create_message`, ...) are marked `#[deprecated]`. They still work —
> it's a compiler warning, not a hard error — and sampling remains part of
> the protocol. Real code that keeps using them (like the examples on this
> page) should wrap the call site in
> `#[allow(deprecated, reason = "SEP-2577 deprecates sampling; kept as an example")]`,
> matching the pattern in `crates/mcp-server/src/tools.rs::ask_llm`.

When a server calls `sampling/createMessage`, the client is expected to
hand the request to an LLM and return the model's response.
`rmcp` exposes the hook as `ClientHandler::create_message`.

## When to read this

- Your client should back a server that uses sampling (e.g. running
  `crates/mcp-server/` and exercising the `ask_llm` tool).
- Writing a desktop / IDE client that integrates a local or remote LLM.
- Building a mock client for tests.

The upstream mock-LLM example is
`submodules/mcp-rust-sdk/examples/clients/src/sampling_stdio.rs`.

## The minimum overriding client

```rust
use rmcp::{
    ClientHandler,
    model::{
        ClientCapabilities, ClientInfo, CreateMessageRequestParams,
        CreateMessageResult, ErrorData, Implementation, SamplingMessage,
    },
    service::{RequestContext, RoleClient},
};

#[derive(Default, Clone)]
struct SamplingClient;

#[allow(deprecated, reason = "SEP-2577 deprecates sampling; kept as an example")]
impl ClientHandler for SamplingClient {
    fn get_info(&self) -> ClientInfo {
        ClientInfo::new(
            ClientCapabilities::builder().enable_sampling().build(),
            Implementation::from_build_env(),
        )
    }

    async fn create_message(
        &self,
        params: CreateMessageRequestParams,
        _ctx: RequestContext<RoleClient>,
    ) -> Result<CreateMessageResult, ErrorData> {
        // Forward params.messages, params.system_prompt, params.max_tokens,
        // and params.temperature to your LLM of choice. Below: mock response.
        let reply = format!(
            "(mock) saw {} message(s), max_tokens={}",
            params.messages.len(),
            params.max_tokens,
        );

        Ok(CreateMessageResult::new(
            SamplingMessage::assistant_text(reply),
            "mock_model".to_string(),
        )
        .with_stop_reason(CreateMessageResult::STOP_REASON_END_TURN))
    }
}
```

Two responsibilities:

1. Advertise the `sampling` capability in `get_info()`. Without this
   the server's `Peer::create_message` call returns an error.
2. Override `create_message` and return a `CreateMessageResult`.

## `CreateMessageRequestParams` shape

Useful fields on the params (full list in
`submodules/mcp-rust-sdk/crates/rmcp/src/model.rs`):

| Field               | Type                                                          |
| ------------------- | ------------------------------------------------------------- |
| `messages`          | `Vec<SamplingMessage>` — the conversation so far              |
| `model_preferences` | `Option<ModelPreferences>` — model hints from the server      |
| `system_prompt`     | `Option<String>`                                              |
| `include_context`   | `Option<IncludeContext>` — `None`, `ThisServer`, `AllServers` |
| `temperature`       | `Option<f32>`                                                 |
| `max_tokens`        | `u32` — required, server-supplied                             |
| `stop_sequences`    | `Option<Vec<String>>`                                         |
| `metadata`          | `Option<Value>`                                               |

`include_context` is the server's way of saying "also feed in context
from MCP servers when sampling." Most clients ignore it — handling it
correctly requires inspecting active sessions, which is application-specific.

## `CreateMessageResult` constructor

`CreateMessageResult::new(message, model_name)` is the minimum shape.
Chain optional builders for stop reason and metadata:

```rust
CreateMessageResult::new(
    SamplingMessage::assistant_text("Hello, world."),
    "gpt-4o-mini".to_string(),
)
.with_stop_reason(CreateMessageResult::STOP_REASON_END_TURN)
```

Known stop-reason constants:

| Constant                                         | Meaning                               |
| ------------------------------------------------ | ------------------------------------- |
| `CreateMessageResult::STOP_REASON_END_TURN`      | Model finished naturally              |
| `CreateMessageResult::STOP_REASON_END_SEQUENCE`  | Hit one of `stop_sequences`           |
| `CreateMessageResult::STOP_REASON_END_MAX_TOKEN` | Output truncated at `max_tokens`      |
| `CreateMessageResult::STOP_REASON_TOOL_USE`      | Model produced a tool call (SEP-1577) |

Use the string literal if the constant you want isn't exposed yet.

## Multi-modal responses

`SamplingMessage::user_text` / `assistant_text` produce text turns. For
images or audio, construct the message manually with the appropriate
`SamplingMessageContentBlock` variant — the sampling-specific content
union (text | image | audio | tool_use | tool_result), distinct from the
general-purpose `ContentBlock` used everywhere else (tool results,
resources, prompts):

```rust
use rmcp::model::{ImageContent, Role, SamplingMessage, SamplingMessageContentBlock};

let img = SamplingMessageContentBlock::Image(ImageContent::new(base64_bytes, "image/png"));
let message = SamplingMessage::new(Role::Assistant, img);
```

`SamplingMessage` is `#[non_exhaustive]`, so build it with
`SamplingMessage::new(role, content)` / `::new_multiple(role, contents)`
rather than a struct literal.

The server side (see `references/rust-sdk/server/sampling.md`) iterates content
blocks via `as_text()` etc., so non-text content needs explicit
handling on both sides.

## Forwarding to a real LLM

The mock client just echoes — a real client wires the params through to
its provider. Sketch:

```rust
async fn create_message(
    &self,
    params: CreateMessageRequestParams,
    _ctx: RequestContext<RoleClient>,
) -> Result<CreateMessageResult, ErrorData> {
    let reply = self
        .anthropic_client
        .complete(&params.messages, params.system_prompt.as_deref(), params.max_tokens)
        .await
        .map_err(|e| ErrorData::internal_error(format!("LLM error: {e}"), None))?;

    Ok(CreateMessageResult::new(
        SamplingMessage::assistant_text(reply.text),
        reply.model_name,
    )
    .with_stop_reason(reply.stop_reason))
}
```

The `anthropic_client` here is illustrative — `rmcp` doesn't ship an
LLM client; you bring your own.

## Honoring `model_preferences`

`ModelPreferences` carries the server's hints:

| Field                   | Meaning                                            |
| ----------------------- | -------------------------------------------------- |
| `cost_priority`         | 0..=1 — higher means prefer cheaper                |
| `speed_priority`        | 0..=1 — higher means prefer faster                 |
| `intelligence_priority` | 0..=1 — higher means prefer more capable           |
| `hints`                 | `Vec<ModelHint>` — explicit model name suggestions |

If you can route between multiple models, use these to pick. If you
only have one, ignore them.

## Authorization and abuse

Sampling lets a server request *arbitrary* LLM output via the user's
LLM budget. UI clients should:

- Show the user what's about to be sampled (the prompt, system prompt,
  message count).
- Ask for permission, at least the first time per server.
- Apply budget limits.

This is policy — `rmcp` doesn't enforce it. But the spec recommends it,
and production clients should follow.

## See also

- `references/rust-sdk/server/sampling.md` — the server side that calls
  `create_message`
- `references/rust-sdk/client/handler.md` — the full `ClientHandler` method list
- `references/rust-sdk/client/elicitation.md` — sibling client-side request
  handler
- `submodules/mcp-rust-sdk/examples/clients/src/sampling_stdio.rs` —
  upstream mock-LLM client
- `submodules/mcp-rust-sdk/examples/servers/src/sampling_stdio.rs` —
  the server it talks to
