# A2UI Evolution Guide — v0.9 → v0.9.1 → v1.0

Use this reference when migrating an existing v0.9 / v0.9.1 implementation to
v1.0, or when deciding which version to target. For the v0.8 → v0.9 diff, see
`references/v0.9/evolution-guide.md`.

## Version status at a glance

| Version | Status | Summary |
| :--- | :--- | :--- |
| v0.9 | Prior (legacy) | Prompt-first redesign; `createSurface` family |
| v0.9.1 | Current (stable) | v0.9 plus MIME standardization and relaxed surface uniqueness |
| v1.0 | Candidate (release) | Bidirectional RPC, `surfaceProperties`, catalog refinements |

## Part 1 — v0.9 → v0.9.1

v0.9.1 is a **minor refinement** of v0.9, fully compatible with v0.9 payloads
(version fields accept both `"v0.9"` and `"v0.9.1"`). Two changes:

1. **MIME type standardization** — all references to the payload MIME type are
   standardized to `application/a2ui+json`, replacing the legacy
   `application/json+a2ui`.
2. **Surface ID uniqueness relaxation** — `surfaceId` no longer needs to be
   unique for the renderer's full lifetime; it must only be unique among
   **currently active** surfaces. It remains an error to `createSurface` on an
   ID that already exists without first deleting it.

Message names and structures are otherwise identical, so the v0.9 protocol
reference stays accurate for v0.9.1. Migration: update any hardcoded MIME type
references to `application/a2ui+json`.

> Note: v1.0 restores the stronger "globally unique for the renderer's
> lifetime" wording for `surfaceId` (the v0.9.1 relaxation was specific to
> v0.9.1).

## Part 2 — v0.9 (incl. 0.9.1) → v1.0

### Executive summary

- **Bidirectional RPC** — synchronous server responses to client actions
  (`actionResponse`, keyed by `actionId`) and server-initiated function
  execution (`callFunction` / `functionResponse`), with execution boundaries
  and return types verified at runtime against catalog definitions rather than
  on the wire.
- `theme` (catalog and `createSurface`) is replaced by `surfaceProperties`;
  `primaryColor` is removed, separating layout from branding.
- Initial `components` and `dataModel` may be embedded directly in
  `createSurface`, enabling a whole UI in one message.
- The catalog `functions` field becomes a **map** keyed by function name
  (was a list).
- Standard JSON Schema metadata (`$schema`, `$id`, `title`, `description`) is
  allowed in catalogs.
- All catalog entity names must conform to UAX #31.
- The `@index` built-in function retrieves the iteration index during list
  template rendering; the `@` prefix is reserved for system context.

### Catalog definition schema

- Renamed `$defs/theme` → `$defs/surfaceProperties`; removed `primaryColor`.
- `functions` changed from a list to a map keyed by function name.
- Added `callableFrom` (enum: `clientOnly`, `remoteOnly`, `clientOrRemote`) to
  `FunctionDefinition` to restrict where a function may be invoked.
- Added an optional `instructions` field (inline Markdown) to the catalog,
  replacing the external `rules.txt`.
- Allowed standard JSON Schema metadata fields despite
  `additionalProperties: false`.
- Enforced UAX #31 naming (`XID_Start` / `XID_Continue`) across component
  names, function names, and argument keys.

### Standard catalogs (basic and minimal)

- Added `posterUrl` to `Video` (preview image before playback).
- Added `placeholder` to `TextField`.
- Added `steps` to `Slider` (snap to discrete intervals).
- Added inline catalog `instructions` (replacing `rules.txt`).
- Renamed the custom SVG icon `svgPath` property to `path`.
- Renamed `$defs/theme` → `$defs/surfaceProperties` in both catalogs.

### Server-to-client messages

- Added `actionResponse` (`ActionResponseMessage`): server responds to a
  specific action call via `actionId` with a `value` or `error`.
- Added `callFunction` (`CallFunctionMessage`): server-initiated function
  execution. `callableFrom` and `returnType` were removed from the wire
  payload, relying on runtime catalog verification.
- Updated `createSurface`: renamed `theme` → `surfaceProperties`; allowed
  inline `components` and `dataModel`.
- Updated all version envelopes from `v0.9` / `v0.9.1` to `v1.0`.

### Client-to-server events

- Added `actionId` to the `action` message — the client generates it when
  `wantResponse: true`.
- Added `functionResponse` (`FunctionResponseMessage`) returning the `value`
  of a server-initiated function call.
- Client `error` messages now support `functionCallId` for function execution
  failures, mutually exclusive with `surfaceId`.

### Client capabilities schema

- Added an optional `instructions` field (plain Markdown) to the catalog
  definition in `client_capabilities.json`.
- Renamed the `theme` capability block to `surfaceProperties`.
- Added static `callableFrom` and `returnType` metadata to
  `FunctionDefinition` to advertise execution boundaries and return types to
  the server.

### Agent card and transport metadata

- Standardized the MIME type to `application/a2ui+json` (IANA-conformant).
- Updated capabilities namespace and A2A metadata params from
  `v0.9` / `v0.9.1` to `v1.0`.
- Extension URI: `https://a2ui.org/a2a-extension/a2ui/v1.0`.

### Data encoding

- **Deletion semantics**: setting a path's value to `null` in
  `updateDataModel` deletes the key. Omitting keys no longer deletes them.
- Removed `callableFrom` / `returnType` from the wire `FunctionCall` and
  dynamic-value schemas — boundary and return-type checks are runtime-only.
- Added the built-in `@index` function (optional `offset`) under
  `FunctionCall`; reserved the `@` prefix for system context.

### Processing rules

- `surfaceId` must be globally unique per client session; creating an existing
  ID without deleting it first is an error.
- Function execution boundaries and return types are looked up at runtime. A
  remote call to a `clientOnly` (or unregistered) function is rejected with
  `INVALID_FUNCTION_CALL`.
- Catalog entity names must comply with UAX #31.
- `@index` is restricted to template instantiation loops (collection scope);
  calling it elsewhere is an evaluation error.

## Migration checklist

### For agents and servers

1. Set `version` to `"v1.0"` in all streamed envelopes.
2. Change the transport MIME type from `application/json+a2ui` to
   `application/a2ui+json` (if not already done for v0.9.1).
3. Rename `theme` → `surfaceProperties` in `createSurface`; remove
   `primaryColor`. Optionally inline `components` / `dataModel`.
4. Convert catalog `functions` from an array to a name-keyed map.
5. Rename `$defs/theme` → `$defs/surfaceProperties`; remove `primaryColor`.
6. Ensure all catalog entity names conform to UAX #31.
7. Do not put `callableFrom` / `returnType` in wire `FunctionCall` payloads;
   keep them as catalog metadata.
8. Rename custom SVG icon `svgPath` → `path`; adopt optional `Video.posterUrl`,
   `TextField.placeholder`, `Slider.steps`.
9. Delete data-model keys by setting them to `null` (never by omission).

### For renderers and clients

1. Parse `callFunction`: check `callableFrom` in the catalog, reject invalid
   calls with `INVALID_FUNCTION_CALL`, and return `functionResponse`.
2. Support `actionResponse`: generate an `actionId` for actions with
   `wantResponse: true`, and write returned values to the data model (using
   `responsePath` when present).
3. Route payloads by inspecting the `version` field (`"v1.0"`).
4. Enforce surface uniqueness — error on a duplicate `createSurface`.
5. Handle `functionCallId` in error reporting; enforce mutual exclusivity with
   `surfaceId`.
6. Verify catalog entity names against UAX #31.
7. Support `@index` during list template rendering (collection scope),
   adjusted by any `offset`.

---

Source: `specification/v1_0/docs/evolution_guide.md` and
`specification/v0_9_1/docs/evolution_guide.md` in `a2ui-project/a2ui`.
