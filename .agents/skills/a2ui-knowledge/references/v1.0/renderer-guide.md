# A2UI v1.0 — Renderer Architecture Guide

The v1.0 renderer architecture is the same as v0.9: a **framework-agnostic**
data layer (`MessageProcessor`, `SurfaceModel`, `DataModel`,
`ComponentContext`) feeding a **framework-specific** view layer
(`ComponentImplementation` nodes), with a Binder layer connecting them. For the
full architecture — the five core interfaces, the three binder strategies
(direct / binder layer / generic-by-reflection), lifecycle and subscription
rules, and the step-by-step build plan — read `references/v0.9/renderer-guide.md`.
That material is unchanged in v1.0.

This guide covers only the **new client responsibilities** v1.0 adds on top of
that architecture.

## New Message Routing

The `MessageProcessor` must handle two additional server-to-client envelope
keys beyond `createSurface` / `updateComponents` / `updateDataModel` /
`deleteSurface`:

- **`callFunction`** — a server-initiated function call (see below).
- **`actionResponse`** — a synchronous reply to a client `action` (see below).

Route messages by inspecting the `version` field (`"v1.0"`) so a client can run
v0.9 and v1.0 surfaces side by side through version-specific controllers.

## Single-Message Surface Creation

`createSurface` may now carry inline `components` and `dataModel`. The
processor should apply them as if an `updateComponents` and an
`updateDataModel` immediately followed the create — building and populating the
tree on creation. `theme` is replaced by `surfaceProperties`; map its fields
(`agentDisplayName`, `iconUrl`, plus any custom ones) to your surface chrome.

## Server-Initiated Functions (`callFunction`)

When a `callFunction` arrives:

1. Look up `call` in the active catalog's function registry.
2. Read the function's `callableFrom` metadata. If omitted, treat it as
   `clientOnly`.
3. If the function is `clientOnly` or unregistered, reject the call: send a
   client-to-server `error` with `code: "INVALID_FUNCTION_CALL"` and the
   `functionCallId`.
4. Otherwise execute the registered implementation with the supplied `args`.
5. If `wantResponse` is `true`, reply with a `functionResponse` echoing
   `functionCallId` and `call` and carrying the returned `value`. On failure,
   reply with an `error` carrying the `functionCallId`.

`functionCallId` and `surfaceId` are mutually exclusive on `error` messages:
use `functionCallId` for function-execution errors, `surfaceId` for
surface/validation errors.

## Synchronous Action Responses (`actionResponse`)

For interactive components whose `action.event` sets `wantResponse: true`:

1. The client generates a unique `actionId` and includes it on the outgoing
   `action` message.
2. The server replies with an `actionResponse` carrying the same `actionId`
   and either a `value` or an `error`.
3. If the originating event declared a `responsePath`, write the returned
   `value` into the local data model at that JSON Pointer (which reactively
   updates any bound components). Match responses to pending actions by
   `actionId`.

This enables patterns like typeahead/autocomplete where a server lookup result
feeds straight back into the UI.

## The `@index` System Function

Add `@index` to the function evaluation path, but scope it to **collection
scope** only. While instantiating a `ChildList` template over a bound array,
track the current iteration index; `@index` returns it (0-based), adjusted by
an optional `offset` argument. Calling `@index` outside template iteration
(e.g. in the root scope) is an evaluation error. The `@` prefix is reserved
for system functions; do not let custom catalogs register `@`-prefixed names.

## Data Model Deletion Semantics

`updateDataModel` now deletes a key **only** when its `value` is `null`.
Omitting a key no longer deletes it (it is simply left unchanged). Implement
upsert-with-explicit-`null`-delete accordingly.

## Identifier Validation

When loading a catalog (built-in or inline), verify that every component name,
function name, and argument/property key conforms to UAX #31
(`^[\p{XID_Start}_][\p{XID_Continue}]*$`). Reject non-conformant catalogs.

---

Source: `specification/v1_0/docs/renderer_guide.md` (core architecture, shared
with v0.9) and `specification/v1_0/docs/a2ui_protocol.md` +
`evolution_guide.md` (v1.0 client responsibilities) in `a2ui-project/a2ui`.
