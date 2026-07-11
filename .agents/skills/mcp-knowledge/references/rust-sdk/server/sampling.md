# Server: sampling

**Sampling** is the server-to-client request `sampling/createMessage`:
the server asks the client's LLM to produce a response. It's the
mechanism that lets MCP servers do model-mediated work (summaries,
translation, decisions) without bundling an LLM themselves.

> **Deprecated by SEP-2577.** As of rmcp 2.0, sampling's types and
> methods (`CreateMessageRequestParams`, `SamplingMessage`,
> `Peer::create_message`, etc.) carry `#[deprecated]` — a compiler
> warning, not a hard error. They remain fully functional and are still
> part of the protocol. Call sites that keep using them (like `ask_llm`
> below) wrap the call in `#[allow(deprecated, reason = "...")]`; mirror
> that pattern in your own code.

## When to read this

- Writing a tool that delegates a reasoning step to the client's LLM.
- A sampling-using tool is returning empty text and you're not sure
  why.
- A client that didn't advertise the `sampling` capability is rejecting
  your request.

The canonical local example is `ask_llm` in
`crates/mcp-server/src/tools.rs:82-128`.

## The minimum sampling tool

```rust
use rmcp::{
    ErrorData as McpError, RoleServer,
    handler::server::wrapper::Parameters,
    model::{CallToolResult, ContentBlock, CreateMessageRequestParams, SamplingMessage},
    service::RequestContext,
    tool,
};

#[allow(deprecated, reason = "SEP-2577 deprecates sampling; kept as an example")]
#[tool(description = "Ask the client's LLM a question via sampling.")]
async fn ask_llm(
    &self,
    Parameters(args): Parameters<AskLlmArgs>,
    ctx: RequestContext<RoleServer>,
) -> Result<CallToolResult, McpError> {
    let response = ctx
        .peer
        .create_message(
            CreateMessageRequestParams::new(
                vec![SamplingMessage::user_text(&args.question)],
                512,
            )
            .with_system_prompt("You are a concise assistant.")
            .with_temperature(0.7),
        )
        .await
        .map_err(|e| McpError::internal_error(format!("sampling request failed: {e}"), None))?;

    let text = response
        .message
        .content
        .iter()
        .find_map(|c| c.as_text())
        .map(|t| t.text.clone())
        .unwrap_or_else(|| "(no text response)".to_string());

    Ok(CallToolResult::success(vec![ContentBlock::text(text)]))
}
```

The pattern:

1. Take `ctx: RequestContext<RoleServer>` as a parameter on the tool
   method — that's how you reach the peer.
2. Build `CreateMessageRequestParams::new(messages, max_tokens)`.
3. Add optional knobs: `.with_system_prompt(...)`, `.with_temperature(...)`,
   `.with_model_preferences(...)`, `.with_stop_sequences(...)`.
4. Call `ctx.peer.create_message(...).await`.
5. Pull text out of the response.

## `SamplingMessage` constructors

| Constructor                                      | What it makes                                                |
| ------------------------------------------------ | ------------------------------------------------------------ |
| `SamplingMessage::user_text("...")`              | User-role text turn                                          |
| `SamplingMessage::assistant_text("...")`         | Assistant-role text turn                                     |
| `SamplingMessage::new(role, content)`            | Any single `SamplingMessageContentBlock` (image, audio, ...) |
| `SamplingMessage::new_multiple(role, vec![...])` | Several content blocks in one turn                           |

`SamplingMessage` is `#[non_exhaustive]`, so struct-literal construction
(`SamplingMessage { role, content, .. }`) no longer compiles outside the
`rmcp` crate — use the constructors above.

For multi-turn sampling, pass a `Vec<SamplingMessage>`. The model sees
the messages in order.

## Iterating response content

`CreateMessageResult.message.content` is a
`SamplingContent<SamplingMessageContentBlock>` enum that can carry one
(`Single`) or many (`Multiple`) content blocks. Each block is a
`SamplingMessageContentBlock` (the old name `SamplingMessageContent` is
now a deprecated type alias) — a flat, `#[non_exhaustive]` enum with
`Text(TextContent)`, `Image(ImageContent)`, `Audio(AudioContent)`,
`ToolUse(ToolUseContent)`, and `ToolResult(ToolResultContent)`
variants.

The canonical extraction pattern is:

```rust
let text = response
    .message
    .content
    .iter()
    .find_map(|c| c.as_text())
    .map(|t| t.text.clone())
    .unwrap_or_else(|| "(no text response)".to_string());
```

`SamplingMessageContentBlock::as_text()` returns `Option<&TextContent>`.
If you need a specific non-text variant, pattern-match directly on the
block:

```rust
use rmcp::model::SamplingMessageContentBlock;

for block in response.message.content.iter() {
    match block {
        SamplingMessageContentBlock::Text(t) => /* t.text */,
        SamplingMessageContentBlock::Image(img) => /* img.data, img.mime_type */,
        SamplingMessageContentBlock::Audio(_) => /* ... */,
        SamplingMessageContentBlock::ToolUse(_) | SamplingMessageContentBlock::ToolResult(_) => {
            /* SEP-1577 tool-use extensions to sampling */
        }
        _ => /* future variants — the enum is #[non_exhaustive] */,
    }
}
```

## Non-text fallback — surface a warning

If your tool only handles text, log when a model returns something
unexpected so future you (or whoever copies the tool) sees there's a
gap:

```rust
let text = match response.message.content.iter().find_map(|c| c.as_text()) {
    Some(t) => t.text.clone(),
    None => {
        tracing::warn!(
            model = %response.model,
            "ask_llm: sampling response contained no text content; \
             non-text content blocks are not handled by this skeleton",
        );
        "(no text response)".to_string()
    }
};
```

That's how `crates/mcp-server/src/tools.rs:113-126` does it.

## Required client capability

The client must advertise `sampling` during `initialize` for the server
to make sampling requests. If the client didn't declare it, the
`create_message` call returns an error.

For a client *test* harness that needs to back the server's sampling
calls, override `ClientHandler::create_message` and declare the
capability — see `references/rust-sdk/client/sampling.md`.

## Common patterns

### Forwarding the user's question

Stuff the user-supplied query into a `SamplingMessage::user_text` turn
and use `with_system_prompt` to set the role / tone:

```rust
CreateMessageRequestParams::new(
    vec![SamplingMessage::user_text(question)],
    512,
)
.with_system_prompt("You are a helpful assistant. Answer concisely.")
.with_temperature(0.4)
```

### Chained reasoning

For a multi-step plan, accumulate `SamplingMessage` turns and feed the
whole transcript back in on each step. There's no built-in conversation
state — your tool owns it.

### Streaming

`create_message` returns the full `CreateMessageResult` once the model
has finished. There is no server-side streaming API in `rmcp` 2.x. If
you need streaming, you'd have to layer your own protocol on top.

## Error handling

Wrap the `create_message` call in `.map_err(...)` to convert
`ServiceError` into `McpError`:

```rust
.await
.map_err(|e| McpError::internal_error(format!("sampling request failed: {e}"), None))?
```

Returning `Err(...)` here surfaces a JSON-RPC error to the client — the
caller sees the tool failed. If you'd rather degrade gracefully (e.g.
return a default text response when the client doesn't support
sampling), check the error string and substitute a fallback.

## See also

- `references/rust-sdk/server/tools.md` — `RequestContext<RoleServer>` as a tool
  parameter
- `references/rust-sdk/server/elicitation.md` — the sibling server-to-client
  request for user input
- `references/rust-sdk/server/roots.md` — the sibling server-to-client request
  for workspace listing
- `references/rust-sdk/client/sampling.md` — implementing the client side
- `crates/mcp-server/src/tools.rs:82-128` — the `ask_llm` worked example
- `submodules/mcp-rust-sdk/examples/servers/src/sampling_stdio.rs` —
  upstream example with multi-turn sampling
