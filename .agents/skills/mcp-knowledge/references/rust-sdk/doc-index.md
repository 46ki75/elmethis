# rmcp (Rust SDK) documentation index

One-line summary of every reference file shipped under the Rust SDK section
of the `mcp-knowledge` skill. Paths in the tables below are relative to
`skills/mcp-knowledge/references/rust-sdk/`. Code citations target either
the local example crate (`crates/mcp-server/`) or the pinned upstream
submodule (`submodules/mcp-rust-sdk/`).

## Shared

| Path               | Topic                                                                                                                              |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `feature-flags.md` | Every Cargo feature on the `rmcp` crate, what it enables, common starter sets, the `reqwest` TLS choice, and common compile errors |

## Server features (`server/`)

### Composition

| Path                        | Topic                                                                                                                                                                                           |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `server/getting-started.md` | Wiring `ToolRouter` / `PromptRouter` / `OperationProcessor` into a single `Server`; the stacked-handler-macros rule; resource handlers as free functions; `get_info` / capability advertisement |

### Primitives

| Path                  | Topic                                                                                                                                                                                                     |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `server/tools.md`     | `#[tool_router]`, `#[tool(description = ...)]`, `Parameters<T>` with `schemars::JsonSchema`, `CallToolResult` shape, `execution(task_support = ...)`, `annotations(...)` and the default-destructive trap |
| `server/prompts.md`   | `#[prompt_router]`, no-arg + single-arg + multi-arg prompts, `Role`, `GetPromptResult::with_description`                                                                                                  |
| `server/resources.md` | Why there is no macro router for resources; `list_resources` / `read_resource` / `list_resource_templates`; URI scheme dispatch with `strip_prefix`; `Resource` / `ResourceTemplate` builders             |
| `server/tasks.md`     | SEP-1686 lifecycle, `OperationProcessor`, `#[task_handler]` macro contract, the canonical `list_tasks` override, cancellation string-matching, timestamp limitation                                       |

### Server-to-client requests

| Path                    | Topic                                                                                                                                                                               |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `server/sampling.md`    | `ctx.peer.create_message(...)`, `CreateMessageRequestParams` builder methods, multimodal content extraction with `as_text()`, `tracing::warn!` fallback pattern                     |
| `server/elicitation.md` | `rmcp::elicit_safe!`, `ctx.peer.elicit::<T>(...)`, the `ElicitationError` must-handle variants (`UserDeclined`, `UserCancelled`, `CapabilityNotSupported`), form vs URL elicitation |
| `server/roots.md`       | `ctx.peer.list_roots()`, `Root` shape, empty-roots fallback                                                                                                                         |

### Transports

| Path                   | Topic                                                                                                                                                                              |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `server/transports.md` | stdio (`rmcp::transport::stdio`) with stderr-only logging; Streamable HTTP via `StreamableHttpService` + `LocalSessionManager` + axum; graceful shutdown; in-memory duplex pointer |

## Client features (`client/`)

### Composition

| Path                        | Topic                                                                                                                                     |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `client/getting-started.md` | Smallest viable `ClientHandler`, `ServiceExt::serve(transport)`, `RunningService<RoleClient, _>`, the `()` and `ClientInfo` blanket impls |
| `client/handler.md`         | Every method on `ClientHandler` (requests + notifications + `get_info`), defaults, the `ClientCapabilities::builder` toggle list          |

### Driving servers

| Path                 | Topic                                                                                                                                                      |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `client/requests.md` | `ClientRequest::*` variant map, convenience wrappers (`.call_tool`, `.list_all_tools`), the untagged-enum gotcha for `CancelTaskResult` vs `GetTaskResult` |

### Answering server-to-client requests

| Path                    | Topic                                                                                                                                   |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `client/sampling.md`    | Overriding `create_message`, `CreateMessageRequestParams` fields, stop-reason constants, forwarding to a real LLM                       |
| `client/elicitation.md` | Overriding `create_elicitation`, `ElicitationAction` (`Accept` / `Decline` / `Cancel`), form vs URL variants, default-decline behavior  |
| `client/roots.md`       | Overriding `list_roots`, `Root::new(...).with_name(...)`, list-changed notifications, static vs dynamic roots                           |

### Transports and testing

| Path                   | Topic                                                                                                                 |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `client/transports.md` | `TokioChildProcess`, `StreamableHttpClientTransport`, Unix socket, `tokio::io::duplex`, custom `IntoTransport`        |
| `client/testing.md`    | The `tokio::io::duplex` harness pattern, bounded polling helpers, in-test capability negotiation, `first_text` helper |

## Cross-references in this skill

| Topic                                | Server file               | Client file                       |
| ------------------------------------ | ------------------------- | --------------------------------- |
| Sampling                             | `server/sampling.md`      | `client/sampling.md`              |
| Elicitation                          | `server/elicitation.md`   | `client/elicitation.md`           |
| Roots                                | `server/roots.md`         | `client/roots.md`                 |
| Transports                           | `server/transports.md`    | `client/transports.md`            |
| Untagged-enum result deserialization | `server/tasks.md` (cause) | `client/requests.md` (mitigation) |

## External pointers

- **Local working example** — `crates/mcp-server/` (server only). Every
  server reference file cites specific files and lines.
- **Upstream rmcp source** — `submodules/mcp-rust-sdk/crates/rmcp/src/`
  is the source of truth when these reference files conflict with reality.
- **Upstream examples** — `submodules/mcp-rust-sdk/examples/servers/`
  and `submodules/mcp-rust-sdk/examples/clients/` cover scenarios these
  files mention but the local example doesn't ship (OAuth flows,
  completion, structured output, sampling-tools, URL elicitation).
- **MCP spec / protocol questions** — see the per-spec-version reference
  files in sibling directories (`references/2024-11-05/`,
  `references/2025-03-26/`, `references/2025-06-18/`,
  `references/2025-11-25/`). This section stays Rust-specific.
