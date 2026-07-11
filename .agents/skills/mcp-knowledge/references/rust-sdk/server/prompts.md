# Server: prompts

MCP **prompts** are user-triggered prompt templates with optional
arguments. `rmcp` exposes them through `#[prompt]` on methods inside a
`#[prompt_router] impl` block — the same shape as tools, with a
different macro pair.

## When to read this

- Authoring or modifying a `#[prompt]` method.
- You need a prompt with typed arguments or optional fields.
- You want to mix user-role and assistant-role messages.

The canonical local example is `crates/mcp-server/src/prompts.rs`.

## The minimum prompt

```rust
use rmcp::{
    ErrorData as McpError,
    handler::server::router::prompt::PromptRouter,
    model::{GetPromptResult, PromptMessage, Role},
    prompt, prompt_router,
};

#[prompt_router]
impl Server {
    #[prompt(name = "greeting", description = "Say hello.")]
    async fn greeting(&self) -> Result<GetPromptResult, McpError> {
        let messages = vec![
            PromptMessage::new_text(Role::User, "Please greet me."),
            PromptMessage::new_text(Role::Assistant, "Hello! How can I help you today?"),
        ];
        Ok(GetPromptResult::new(messages))
    }
}
```

Wire it into `Server` exactly like the tool router:

```rust
pub struct Server {
    tool_router: ToolRouter<Server>,
    prompt_router: PromptRouter<Server>,
    /* ... */
}

impl Server {
    pub fn new() -> Self {
        Self {
            tool_router: Self::tool_router(),
            prompt_router: Self::prompt_router(),
            /* ... */
        }
    }
}

#[tool_handler]
#[prompt_handler]
impl ServerHandler for Server {}
```

## Typed prompt arguments

`Parameters<T>` works the same as for tools. The arg struct derives
`Deserialize` and `JsonSchema`:

```rust
use rmcp::handler::server::wrapper::Parameters;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, schemars::JsonSchema)]
pub struct EchoArgs {
    /// The message to echo back.
    pub message: String,
}

#[prompt_router]
impl Server {
    #[prompt(name = "echo", description = "Echo a message back.")]
    async fn echo(
        &self,
        Parameters(args): Parameters<EchoArgs>,
    ) -> Result<GetPromptResult, McpError> {
        let messages = vec![PromptMessage::new_text(
            Role::User,
            args.message,
        )];
        Ok(GetPromptResult::new(messages))
    }
}
```

The argument schema appears in `prompts/list` so the client can render
a form. Doc-comments on fields become per-argument descriptions.

## Multi-argument prompts with optionals

Optional arguments use `Option<T>` with
`#[serde(skip_serializing_if = "Option::is_none")]`:

```rust
#[derive(Debug, Serialize, Deserialize, schemars::JsonSchema)]
pub struct SummarizeArgs {
    /// The topic to summarize.
    pub topic: String,
    /// How many bullets to produce (must be > 0).
    pub bullet_count: u8,
    /// Optional tone: "neutral", "casual", "formal".
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tone: Option<String>,
}
```

If you need to validate values *beyond* what the schema captures (e.g.
`bullet_count > 0`), check inside the prompt method and return
`Err(McpError::invalid_params(...))` for bad input.

## Message roles

`Role` (the same enum used by sampling messages) has two variants:
`User` and `Assistant`. A canned exchange typically alternates them so
the model sees a complete turn. There's no `System` role at the prompt
level — system prompts belong to sampling requests
(`CreateMessageRequestParams::with_system_prompt`).

```rust
PromptMessage::new_text(Role::User, "Summarize the topic.")
PromptMessage::new_text(Role::Assistant, "Here's a summary: ...")
```

## Result shape

`GetPromptResult::new(messages)` is enough for most cases.
`.with_description(s)` attaches a human-readable description that
clients may surface in their prompt picker.

## Capability declaration

`#[prompt_handler]` auto-implements `list_prompts` and `get_prompt`,
but the server still has to **advertise** prompt support in its
capabilities:

```rust
fn get_info(&self) -> ServerInfo {
    ServerInfo::new(
        ServerCapabilities::builder()
            .enable_tools()
            .enable_prompts()  // <-- this
            /* ... */
            .build(),
    )
    /* ... */
}
```

Without `enable_prompts`, clients may skip the `prompts/list` call
entirely.

## Gotchas

### Prompt arguments are typed as JSON, not Rust enums

Even if you declare a field as a Rust enum with `JsonSchema`, the wire
representation is a JSON string. Clients won't know which values are
allowed unless you put them in the schema (use
`#[schemars(extend = "value")]` or `#[serde(rename_all = ...)]` on the
enum variants) or document them in the doc-comment.

### Avoid stuffing too much into a single prompt

If a prompt needs a lot of conditional logic, consider splitting it into
multiple prompts the client can choose between, or using a tool that
returns a prompt-shaped response. Prompts are mostly for static-template
expansion.

### Macros generate associated items

Like `#[tool_router]`, `#[prompt_router]` generates an associated
function with the same visibility as the `impl` block. Pass `vis` if
you want it more or less visible.

## See also

- `references/rust-sdk/server/getting-started.md` — composing routers
- `references/rust-sdk/server/tools.md` — same macro shape, different primitive
- `crates/mcp-server/src/prompts.rs` — three worked examples
- `crates/mcp-server/tests/prompts.rs` — round-trip integration test
