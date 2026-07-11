# A2UI v0.9 — Custom Catalog Guide

This guide covers the **end-to-end** workflow for replacing or extending the
Basic Catalog with your own application-specific catalog: defining the
schema, registering components in the renderer, the catalog-negotiation
handshake, versioning, validation, and graceful degradation.

## Table of Contents

- [Why Define a Custom Catalog](#why-define-a-custom-catalog)
- [Catalog Schema Anatomy](#catalog-schema-anatomy)
- [Building a Catalog](#building-a-catalog)
- [Authoring a Component (Schema → Implementation → Registration)](#authoring-a-component-schema--implementation--registration)
- [Catalog Negotiation Handshake](#catalog-negotiation-handshake)
- [Versioning and Migrations](#versioning-and-migrations)
- [Validation Strategy](#validation-strategy)
- [Graceful Degradation](#graceful-degradation)
- [Security Considerations](#security-considerations)
- [Agent-Side Integration (ADK)](#agent-side-integration-adk)
- [Inline Catalogs](#inline-catalogs)

## Why Define a Custom Catalog

Every A2UI surface is driven by a Catalog — a JSON Schema file telling the
agent which components, functions, and themes are available. The Basic
Catalog is deliberately sparse to be implementable across renderers; most
production apps replace it.

Benefits:

- **Design-system alignment** — restrict the agent to your real components,
  not generic primitives.
- **Security / type safety** — you register the entire catalog with the
  client app, so only trusted components ever render.
- **No mappers needed** — catalogs that mirror your component library beat
  Basic-Catalog-plus-adapter every time. Since the LLM interprets the
  catalog itself, you don't need a portable lingua franca across clients.

| Use case | Recommendation | Effort |
| :--- | :--- | :--- |
| A2UI added to a mature frontend | Define a catalog mirroring your existing design system | Medium |
| Greenfield app | Start with the Basic Catalog; evolve into your own as the app matures | Low (assuming a renderer exists) |

## Catalog Schema Anatomy

The full catalog schema (excerpted from `client_capabilities.json`):

```json
{
  "Catalog": {
    "type": "object",
    "description": "A collection of component and function definitions.",
    "properties": {
      "catalogId":  { "type": "string", "description": "Unique identifier" },
      "components": { "type": "object", "additionalProperties": { "$ref": "https://json-schema.org/draft/2020-12/schema" } },
      "functions":  { "type": "array",  "items": { "$ref": "#/$defs/FunctionDefinition" } },
      "theme":      { "type": "object", "additionalProperties": { "$ref": "https://json-schema.org/draft/2020-12/schema" } }
    },
    "required": ["catalogId"],
    "additionalProperties": false
  }
}
```

Key constraints:

- **Freestanding** — final catalogs MUST have no external `$ref`s. This
  simplifies LLM inference and removes runtime dependencies. You **may** use
  external `$ref`s during local development and bundle them with
  `tools/build_catalog/assemble_catalog.py` before publishing.
- **Validator-compliant types** — when a property references another
  component by id, use
  `"$ref": "common_types.json#/$defs/ComponentId"` (not raw `string`); for
  lists/templates, use `ChildList`. Raw strings make validators treat the
  field as static text and silently miss broken references.

## Building a Catalog

### Minimal example

A catalog with one component:

```json
{
  "$id": "https://github.com/.../hello_world/v1/catalog.json",
  "components": {
    "HelloWorldBanner": {
      "type": "object",
      "description": "A simple banner greeting.",
      "properties": {
        "message": { "type": "string", "description": "The banner text." },
        "backgroundColor": { "type": "string", "default": "#f0f0f0" }
      },
      "required": ["message"]
    }
  }
}
```

Generated payload:

```json
[
  { "version": "v0.9",
    "createSurface": { "surfaceId": "hello-world-surface",
                       "catalogId": "https://github.com/.../hello_world/v1/catalog.json" } },
  { "version": "v0.9",
    "updateComponents": { "surfaceId": "hello-world-surface",
                          "components": [
                            { "id": "root", "component": "HelloWorldBanner",
                              "message": "Hello, world!", "backgroundColor": "#4CAF50" }
                          ] } }
]
```

### Extending the Basic Catalog

```json
{
  "$id": "https://github.com/.../my_app/v1/catalog.json",
  "components": {
    "allOf": [
      { "$ref": "basic_catalog_definition.json#/components" },
      {
        "SuggestionChips": {
          "type": "object",
          "description": "A list of suggested prompts",
          "properties": { "suggestions": { "type": "array", "description": "The suggested prompts." } },
          "required": ["suggestions"]
        }
      }
    ]
  }
}
```

### Cherry-picking from the Basic Catalog

```json
{
  "$id": "https://github.com/.../popup_app/v1/catalog.json",
  "components": {
    "allOf": [
      { "$ref": "basic_catalog.json#/components/Text" },
      {
        "Popup": {
          "type": "object",
          "description": "A modal overlay that displays an icon and text.",
          "properties": { "text": { "$ref": "common_types.json#/$defs/ComponentId" } },
          "required": ["text"]
        }
      }
    ]
  }
}
```

### Bundling with `assemble_catalog.py`

```bash
uv run tools/build_catalog/assemble_catalog.py [INPUTS ...] \
  --output-name <OUTPUT_NAME> \
  [--catalog-id <ID>] \
  [--version 0.9 | 0.10] \
  [--extend-basic-catalog] \
  [--out-dir <DIR>] \
  [--verbose]
```

Key flags:

- `--output-name` (required) — name of the combined catalog file.
- `--catalog-id` — defaults to `urn:a2ui:catalog:<base_name>`.
- `--version` — A2UI spec version for official fallbacks (`0.9` or `0.10`).
- `--extend-basic-catalog` — automatically inline the entire
  `basic_catalog.json` even if your inputs don't reference it.

## Authoring a Component (Schema → Implementation → Registration)

The four-step workflow, illustrated with the `rizzcharts` sample's `Chart`
component (Angular renderer).

### 1. Define the schema

In `rizzcharts_catalog_definition.json`:

```json
"Chart": {
  "type": "object",
  "description": "An interactive chart that uses a hierarchical list of objects for its data.",
  "properties": {
    "type":  { "type": "string", "description": "The type of chart to render.", "enum": ["doughnut", "pie"] },
    "title": { "type": "object",
               "properties": { "literalString": {"type": "string"}, "path": {"type": "string"} } },
    "chartData": { "type": "object",
      "properties": {
        "literalArray": {
          "type": "array",
          "items": { "type": "object",
                     "properties": { "label": {"type": "string"}, "value": {"type": "number"},
                                     "drillDown": { "type": "array",
                                       "items": { "type": "object",
                                                  "properties": { "label": {"type": "string"}, "value": {"type": "number"} },
                                                  "required": ["label", "value"] } } },
                     "required": ["label", "value"] }
        },
        "path": { "type": "string" }
      }
    }
  },
  "required": ["type", "chartData"]
}
```

### 2. Implement the component (Angular)

Extend `DynamicComponent` from `@a2ui/angular`:

```typescript
import { DynamicComponent } from '@a2ui/angular';
import * as Primitives from '@a2ui/web_core/types/primitives';
import * as Types from '@a2ui/web_core/types/types';
import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'a2ui-chart',
  template: `
    <div>
      <h2>{{ resolvedTitle() }}</h2>
      <canvas baseChart [data]="currentData()" [type]="chartType()"></canvas>
    </div>
  `,
})
export class Chart extends DynamicComponent<Types.CustomNode> {
  readonly type = input.required<string>();
  protected readonly chartType = computed(() => this.type() as ChartType);

  readonly title = input<Primitives.StringValue | null>();
  protected readonly resolvedTitle = computed(() => super.resolvePrimitive(this.title() ?? null));

  readonly chartData = input.required<Primitives.StringValue | null>();
  // ... data resolution logic using super.resolvePrimitive for data paths
}
```

`super.resolvePrimitive` is the helper that turns A2UI `DynamicString` /
`DynamicArray` shapes into real values, handling both literals and `path`
bindings.

### 3. Register in the client catalog

```typescript
import { Catalog, DEFAULT_CATALOG } from '@a2ui/angular';
import { inputBinding } from '@angular/core';

export const RIZZ_CHARTS_CATALOG = {
  ...DEFAULT_CATALOG,            // include the Basic Catalog
  Chart: {
    type: () => import('./chart').then(r => r.Chart),   // lazy-loaded
    bindings: ({ properties }) => [
      inputBinding('type',      () => ('type' in properties && properties['type']) || undefined),
      inputBinding('title',     () => ('title' in properties && properties['title']) || undefined),
      inputBinding('chartData', () => ('chartData' in properties && properties['chartData']) || undefined),
    ],
  },
} as Catalog;
```

### 4. Wire the agent (see "Agent-Side Integration" below)

## Catalog Negotiation Handshake

Three steps:

### Step 1 — Agent advertises support (optional)

A2A AgentCard hint:

```json
{
  "name": "Ecommerce Dashboard Agent",
  "capabilities": {
    "extensions": [{
      "uri": "https://a2ui.org/a2a-extension/a2ui/v0.9",
      "params": {
        "supportedCatalogIds": [
          "https://a2ui.org/specification/v0_9/basic_catalog.json",
          "https://github.com/.../rizzcharts_catalog_definition.json"
        ]
      }
    }]
  }
}
```

Informational — helps the client know what to expect, doesn't bind the
agent.

### Step 2 — Client declares support (required, every message)

Every outbound A2A message metadata carries `a2uiClientCapabilities` with a
**preference-ordered** list:

```json
{
  "parts": [{ "text": "What is the current status of my flight?" }],
  "metadata": {
    "a2uiClientCapabilities": {
      "supportedCatalogIds": [
        "https://a2ui.org/specification/v0_9/basic_catalog.json",
        "https://github.com/.../rizzcharts_catalog_definition.json"
      ]
    }
  }
}
```

### Step 3 — Agent picks per-surface

When the agent creates a surface, it picks the best match from the client's
list. Once chosen, the choice is **locked for the lifetime of that
surface**. If no compatible catalog is found, the agent does not send UI.

```json
{
  "createSurface": {
    "surfaceId": "salesDashboard",
    "catalogId": "https://a2ui.org/specification/v0_9/basic_catalog.json"
  }
}
```

## Versioning and Migrations

### `catalogId` is a URI

Recommended pattern: `https://example.com/catalogs/mysurface/v1/catalog.json`.

- The URI is **just an identifier** — no runtime fetch. The catalog
  definition must be known to both agent and client beforehand (compile/
  deploy time).
- URIs make IDs globally unique and easy for humans to inspect.

### Breaking vs non-breaking

The standard JSON parser ignores unknown fields, but in a server-driven UI
silently dropping a *container* component drops its entire subtree. Update
classification:

**Breaking (major version bump required)** — bump `v1` → `v2`:

- Adding a container (old clients would render no children when the
  container is dropped).
- Removing a container.
- Changing a property's type (validator failure on older clients).
- Adding a required property without a default.

**Non-breaking (stay on current major)**:

- Adding a leaf component (safe to ignore).
- Adding an optional property.
- Removing a property (clients can ignore if no longer sent).
- Adding new functions or styles.
- Doc-only changes (`description`, typo fixes).

### Migration playbook

To roll out a new major version without downtime:

1. **Client updates first** — clients advertise *both* versions
   (`[".../v2/...", ".../v1/..."]`) in `supportedCatalogIds`.
2. **Agents update** — rebuilt agents see v2 and prefer it.
3. **Legacy support** — older agents that haven't been rebuilt still match
   v1 in the client's list and remain functional.

## Validation Strategy

Two-phase, defense in depth:

### Agent-side (pre-send)

Before transmitting any UI payload, the agent runtime validates the
generated JSON against the catalog.

- **Purpose** — catch hallucinated properties or malformed structures at
  the source.
- **Outcome on failure** — agent attempts to fix/regenerate the JSON, or
  gracefully degrades (e.g. plain text response).

### Client-side

The client library validates the payload against its local catalog
definition before rendering.

- **Purpose** — security + stability against version mismatches or
  compromised agent outputs.
- **Outcome on failure** — emit a `VALIDATION_FAILED` error back to the
  agent:

```json
{
  "version": "v0.9",
  "error": {
    "code": "VALIDATION_FAILED",
    "surfaceId": "flight-status-card-123",
    "path": "/components/FlightCard/flightNumber",
    "message": "Missing required property 'flightNumber' in component 'FlightCard'."
  }
}
```

## Graceful Degradation

Even after schema validation passes, the renderer may hit runtime issues
(missing asset, component implementation not loaded, platform limitation).
**Don't crash.**

- **Unknown components** — render a safe fallback (a generic card with the
  component's debug name) or skip the node entirely.
- **Text fallback** — if a whole surface fails to render, display the raw
  text description (if available) or a generic message like
  "This interface could not be displayed."

Real-world version-skew scenarios:

- **Old iOS client, newer agent** — agent sends a new `Badge` component;
  the old client renders a placeholder/text fallback. Agent sends a new
  property on `Button`; the old client ignores it. Agent removed a
  component the old client supports; nothing breaks because the agent just
  stops sending it.
- **New web client, older agent** — client supports new `Badge` but the
  agent never sends it; no issue. Client removed an old property and
  ignores it if the agent still sends it. Client added new styles the
  agent doesn't use; no issue.

## Security Considerations

1. **Allowlist components** — only register components you trust. Don't
   expose components that offer dangerous capabilities (script execution,
   `<iframe src="...">` with arbitrary URLs) unless they're tightly
   constrained.
2. **Validate properties** — always validate agent-supplied properties
   against type constraints before rendering. Schema validation is the
   first line; runtime validation is the second.
3. **Sanitize text** — never render unsanitized agent-provided content
   unless the rendering path is known-safe (e.g. the renderer's Markdown
   pipeline does sanitization).
4. **Pre-compile catalogs into the client** — do not fetch catalogs at
   runtime from the network. Inline catalogs in `a2uiClientCapabilities`
   exist for local dev only; production catalogs must be compile-time.

## Agent-Side Integration (ADK)

The Python ADK provides a turnkey path for wiring an agent to a custom
catalog.

### Session preparation (executor)

Intercept the incoming message to detect A2UI activation and the catalog
the client supports; resolve and stash it in session state:

```python
use_ui = try_activate_a2ui_extension(context)
if use_ui:
    a2ui_catalog = self.schema_manager.get_selected_catalog(
        client_ui_capabilities=capabilities
    )
    examples = self.schema_manager.load_examples(a2ui_catalog, validate=True)

    await runner.session_service.append_event(
        session,
        Event(actions=EventActions(state_delta={
            _A2UI_ENABLED_KEY: True,
            _A2UI_CATALOG_KEY: a2ui_catalog,
            _A2UI_EXAMPLES_KEY: examples,
        })),
    )
```

`A2uiSchemaManager` is responsible for choosing the right catalog from the
client's advertised list and pre-loading validated examples for the LLM
prompt.

### Tool setup

Expose `SendA2uiToClientToolset` so the LLM can emit A2UI payloads as tool
calls:

```python
from a2ui.adk.send_a2ui_to_client_toolset import SendA2uiToClientToolset

a2ui_catalog = self.schema_manager.get_selected_catalog(
    client_ui_capabilities=capabilities
)
agent.tools = [
    SendA2uiToClientToolset(
        a2ui_catalog=a2ui_catalog,
        a2ui_enabled=True,
    )
]
```

### Event converter

Bridge the LLM's tool calls into A2A `DataPart`s with the A2UI mimeType:

```python
from a2ui.adk.send_a2ui_to_client_toolset import A2uiEventConverter

config = A2aAgentExecutorConfig(event_converter=A2uiEventConverter())
```

## Inline Catalogs

`a2uiClientCapabilities.inlineCatalogs` lets the client supply a full
catalog definition at runtime. **Supported, but not recommended in
production** — it's intended for local dev, where round-tripping a catalog
through the agent build is too slow. In production, pre-compile catalogs
into the agent's deployment.

The agent must have advertised `acceptsInlineCatalogs: true` (in
`server_capabilities.json`) for an inline catalog to be honored.

---

Source: synthesized from `submodules/A2UI/docs/concepts/catalogs.md`,
`submodules/A2UI/docs/guides/defining-your-own-catalog.md`, and
`submodules/A2UI/docs/guides/authoring-components.md`.
