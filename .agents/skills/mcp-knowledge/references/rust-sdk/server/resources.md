# Server: resources

MCP **resources** are URI-addressed pieces of context (files, DB rows,
in-memory text). They come in two flavors:

- **Static resources** — fixed URIs returned by `resources/list`,
  fetched by exact match.
- **Resource templates** — URI patterns like `echo://{message}` or
  `greet://{language}/{name}` returned by `resources/templates/list`,
  fetched by filling in the variables.

## When to read this

- Exposing files / generated text / DB records as MCP resources.
- A client is failing to read a URI you advertised.
- You want URI templates and aren't sure how to dispatch by scheme.

The canonical local example is `crates/mcp-server/src/resources.rs`.

## Why there's no `#[resource_router]`

`rmcp` doesn't ship a procedural macro for resources. Two reasons:

1. Resources are URI-addressed, not name-addressed. The dispatch
   function depends on your URI scheme and parsing rules — there's no
   one-size-fits-all router.
2. Resource lookup is often dynamic (filesystem scan, DB query) rather
   than statically declared at the type level.

The path is to **implement the three trait methods directly** on
`ServerHandler` and delegate to free functions you control:

```rust
#[tool_handler]
#[prompt_handler]
impl ServerHandler for Server {
    async fn list_resources(
        &self,
        _request: Option<PaginatedRequestParams>,
        _ctx: RequestContext<RoleServer>,
    ) -> Result<ListResourcesResult, McpError> {
        Ok(resources::list_resources(self))
    }

    async fn read_resource(
        &self,
        request: ReadResourceRequestParams,
        _ctx: RequestContext<RoleServer>,
    ) -> Result<ReadResourceResult, McpError> {
        resources::read_resource(self, request)
    }

    async fn list_resource_templates(
        &self,
        _request: Option<PaginatedRequestParams>,
        _ctx: RequestContext<RoleServer>,
    ) -> Result<ListResourceTemplatesResult, McpError> {
        Ok(resources::list_resource_templates(self))
    }
}
```

The free functions live in their own module so the `impl ServerHandler`
block stays compact.

## Listing static resources

```rust
use rmcp::model::{ListResourcesResult, Resource};

const EXAMPLE_RESOURCE_URI: &str = "mem://example";
const EXAMPLE_RESOURCE_NAME: &str = "example";

pub fn list_resources(_server: &Server) -> ListResourcesResult {
    let resource: Resource = Resource::new(
        EXAMPLE_RESOURCE_URI,
        EXAMPLE_RESOURCE_NAME.to_string(),
    );
    ListResourcesResult {
        resources: vec![resource],
        next_cursor: None,
        meta: None,
    }
}
```

`Resource` is a flat, `#[non_exhaustive]` struct (no more `Annotated<RawResource>`
wrapper). `Resource::new(uri, name)` builds it directly; chain
`.with_title(...)`, `.with_description(...)`, `.with_mime_type(...)`,
`.with_size(...)`, `.with_icons(...)`, or `.with_annotations(...)` to attach
optional fields like audience or priority hints.

## Reading resources — dispatch by scheme

`read_resource` receives a `ReadResourceRequestParams { uri, .. }`.
Match on the URI scheme:

```rust
use rmcp::model::{ReadResourceRequestParams, ReadResourceResult, ResourceContents};
use serde_json::json;

const ECHO_RESOURCE_SCHEME: &str = "echo://";
const GREET_RESOURCE_SCHEME: &str = "greet://";

pub fn read_resource(
    _server: &Server,
    request: ReadResourceRequestParams,
) -> Result<ReadResourceResult, McpError> {
    if request.uri == EXAMPLE_RESOURCE_URI {
        return Ok(ReadResourceResult::new(vec![ResourceContents::text(
            "Static body.",
            request.uri.clone(),
        )]));
    }

    if let Some(message) = request.uri.strip_prefix(ECHO_RESOURCE_SCHEME) {
        if message.is_empty() {
            return Err(McpError::invalid_params(
                "echo:// requires a non-empty message segment",
                Some(json!({ "uri": request.uri })),
            ));
        }
        return Ok(ReadResourceResult::new(vec![ResourceContents::text(
            message,
            request.uri.clone(),
        )]));
    }

    if let Some(rest) = request.uri.strip_prefix(GREET_RESOURCE_SCHEME) {
        let mut parts = rest.splitn(2, '/');
        let language = parts.next().filter(|s| !s.is_empty());
        let name = parts.next().filter(|s| !s.is_empty());
        return match (language, name) {
            (Some(language), Some(name)) => Ok(ReadResourceResult::new(vec![
                ResourceContents::text(render_greeting(language, name), request.uri.clone()),
            ])),
            _ => Err(McpError::invalid_params(
                "greet:// requires both a language and a name segment",
                Some(json!({ "uri": request.uri })),
            )),
        };
    }

    Err(McpError::resource_not_found(
        "resource_not_found",
        Some(json!({ "uri": request.uri })),
    ))
}
```

Two things to notice:

1. `strip_prefix` returns `None` if the URI doesn't have the expected
   prefix — the `if let` short-circuits.
2. The two templates handle empty segments differently. `echo://` is
   permissive (anything after the scheme is echoed, including slashes
   like `echo://a/b`), while `greet://` enforces a fixed
   `{language}/{name}` shape. The skeleton makes this asymmetry
   deliberate; see the comment at
   `crates/mcp-server/src/resources.rs:47-50`.

## Advertising templates

`resources/templates/list` returns the parameterized URI patterns the
client can fill in:

```rust
use rmcp::model::{ListResourceTemplatesResult, ResourceTemplate};

const ECHO_RESOURCE_TEMPLATE: &str = "echo://{message}";
const GREET_RESOURCE_TEMPLATE: &str = "greet://{language}/{name}";

pub fn list_resource_templates(_server: &Server) -> ListResourceTemplatesResult {
    let echo: ResourceTemplate = ResourceTemplate::new(ECHO_RESOURCE_TEMPLATE, "echo")
        .with_description("Reads back whatever appears after `echo://`.")
        .with_mime_type("text/plain");
    let greet: ResourceTemplate = ResourceTemplate::new(GREET_RESOURCE_TEMPLATE, "greet")
        .with_description("Localized greeting. Supported languages: en, ja, es, fr.")
        .with_mime_type("text/plain");
    ListResourceTemplatesResult {
        resource_templates: vec![echo, greet],
        next_cursor: None,
        meta: None,
    }
}
```

Templates use RFC 6570 URI Template syntax (`{name}`), and `rmcp`
itself doesn't enforce a parser — your `read_resource` is responsible
for matching them.

## `ResourceContents` shape

Two main variants:

| Variant                                               | Use for                             |
| ----------------------------------------------------- | ----------------------------------- |
| `ResourceContents::text(text, uri)`                   | UTF-8 text                          |
| `ResourceContents::blob(base64_data, uri, mime_type)` | Binary content (images, PDFs, etc.) |

For binary content you encode the bytes as base64 before constructing
the variant — `rmcp` enables the `base64` feature by default.

## Capability declaration

Advertise resource support in `get_info`:

```rust
ServerCapabilities::builder()
    .enable_resources()
    /* ... */
    .build()
```

`.enable_resources_list_changed()` and `.enable_resources_subscribe()`
toggle the corresponding optional capabilities (live notifications when
the list changes, per-resource update subscriptions).

## Gotchas

### URI template `mimeType` is advisory

Setting `.with_mime_type("text/plain")` tells the client what to
*expect*, but each `ResourceContents::text(...)` or `::blob(...)` you
return carries its own MIME info. Keep the two consistent.

### Empty `read_resource` returns 404

If `read_resource` returns
`Err(McpError::resource_not_found(...))`, the client sees a JSON-RPC
error. Return `invalid_params` for parse errors and `resource_not_found`
for genuine "not in my registry" cases.

### Pagination is supported

Both `list_resources` and `list_resource_templates` accept
`PaginatedRequestParams` and return `next_cursor`. For small registries
the simplest thing is to ignore both. For large registries paginate the
internal store and surface a cursor.

## See also

- `references/rust-sdk/server/getting-started.md` — the `impl ServerHandler`
  block that delegates here
- `crates/mcp-server/src/resources.rs` — full canonical example
- `crates/mcp-server/tests/resources.rs` — round-trip integration tests
