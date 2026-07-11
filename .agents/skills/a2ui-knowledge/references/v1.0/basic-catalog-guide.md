# A2UI v1.0 — Basic Catalog Implementation Guide

Per-component implementation reference for renderer / client developers
targeting the v1.0 Basic Catalog. Use it when wiring framework adapters
(Layer 3 in `renderer-guide.md`) over the generic A2UI bindings. The
per-component behavior is the same as v0.9; this guide highlights the v1.0
deltas inline.

## What Changed from v0.9

- **`Video.posterUrl`** — preview image shown before playback.
- **`TextField.placeholder`** — placeholder text for the input.
- **`Slider.steps`** — integer (≥1) number of discrete divisions; the slider
  snaps to discrete values when set.
- **Custom SVG `Icon`** — the icon override object property `svgPath` was
  renamed to **`path`** (`{ "name": { "path": "M3 12 …" } }`).
- **`surfaceProperties`** replaces the catalog `theme`; `primaryColor` is gone.
- The catalog carries inline **`instructions`** (Markdown), replacing
  `rules.txt`.
- All catalog entity names must comply with **UAX #31** (see below).

## Mandatory Identifier Rules

All entity names in a v1.0 catalog — component types, function names, and
argument/property keys — MUST comply with UAX #31:

- Begin with `XID_Start` or underscore (`_`); never a digit.
- Continue with `XID_Continue`.
- Exclude whitespace and `Pattern_Syntax` symbols (other than `_`).

Canonical regex: `^[\p{XID_Start}_][\p{XID_Continue}]*$`

## Components

### Text

Displays text; supports simple Markdown. Render through a Markdown parser when
available, else fall back to raw text (stripping `**`, `#` for legibility).
Variants: `h1`–`h5` (suggested 2.5x / 2x / 1.75x / 1.5x / 1.25x base),
`caption` (~0.8x, lighter/italic), `body` (default).

### Image

Image from a URL; default to flexible width filling the container. Map `fit` to
the platform content-scale mode. Variants: `icon` (~24dp square), `avatar`
(small rounded), `smallFeature` (~100dp), `mediumFeature` (default),
`largeFeature`, `header` (full-width banner, cover/crop).

### Icon

System icon by `name` (e.g. `accountCircle` → `account_circle`). Default 24dp,
inherit text color. A custom vector icon can be supplied as
`{ "path": "<SVG path data>" }` — note the property is **`path`** in v1.0
(renamed from `svgPath`).

### Video

Native video player with controls; full container width; support scrubbing.
**`posterUrl`** (new) supplies a preview image displayed before the video
plays.

### AudioPlayer

Native audio player with controls; full container width; support scrubbing.

### Row

Horizontal layout. `justify` → main axis (`start`, `center`, `end`,
`spaceBetween`); `align` → cross axis. Fill available width.

### Column

Vertical layout. Mirrors `Row`, with `justify` vertical and `align` horizontal.

### List

Scrollable list. `direction` defaults to `vertical`; for `horizontal`, hide the
scrollbar where possible and give children a bounded max width.

### Card

Card-styled container — distinct background, rounded corners, subtle elevation,
inner padding (~16dp). **Accepts exactly one child** (wrap multiples in a
`Column` or `Row`).

### Tabs

Selectable headers above the active tab's child. Keep a local `selectedIndex`
(default `0`); on tap, update it and render that index's child; indicate the
active tab visually.

### Divider

`axis: horizontal` (default) — 1dp tall, full width. `axis: vertical` — 1dp
wide, full height.

### Modal

A dialog that is a modal **entry point**: render only the `trigger` child in
the tree; on tap, open the modal and render the `content` child. Provide a
close affordance.

### Button

Dispatches an action when tapped; always renders its `child`. Variants:
`default`, `primary`, `borderless`. Action context resolves at interaction time
(reflecting the latest inputs). `checks` that fail disable the button. Since
`primaryColor` was removed, the `primary` variant should use the native
framework's accent/primary color rather than a catalog-supplied hex.

### TextField

Native text input establishing two-way binding (writes to the bound `value`
path on each keystroke). Variants: `shortText` (default), `longText`, `number`,
`obscured`. **`placeholder`** (new) supplies placeholder text. `label` is
required.

### CheckBox

Native checkbox/toggle alongside its label; two-way binds a boolean to the
`value` path.

### ChoicePicker

Selects one or more options. `variant: "mutuallyExclusive"` (single) or
`"multipleSelection"`. Binds to an array of selected string values.

### Slider

Native slider/seek bar. `min`/`max` set the range; the value is a `number`, so
decimal ranges are valid. **`steps`** (new, integer ≥1) sets the number of
discrete divisions; when present, the slider snaps to discrete values
(`value` and `max` are required). Two-way bind on drag.

### DateTimeInput

Native date/time picker. `enableDate` + `enableTime` toggle which pickers show.
Read/write **ISO 8601 strings** to the data model.

## Surface Properties

v1.0 replaces the catalog `theme` with `surfaceProperties` (set in
`createSurface`). The Basic Catalog defines:

| Property | Type | Use |
| :--- | :--- | :--- |
| `iconUrl` | URI | Agent/tool avatar shown next to the surface |
| `agentDisplayName` | string | Text identity shown next to the surface |

`primaryColor` was **removed** — branding is deferred to the native framework's
theme. `surfaceProperties` allows additional properties
(`additionalProperties: true`), so custom catalogs can extend it.

In multi-agent systems an orchestrator should set/verify `iconUrl` and
`agentDisplayName` so malicious sub-agents can't spoof a trusted identity.

## Client-Side Functions

Most functions are pure logic — they take resolved args and return a value;
the Binder layer wraps execution in a reactive stream. `formatString` parses
its own `${...}` expression to find dependencies. The Basic Catalog functions
are: `required`, `regex`, `length`, `numeric`, `email` (validation);
`formatString`, `formatNumber`, `formatCurrency`, `formatDate`, `pluralize`
(formatting); `and`, `or`, `not` (logic); `openUrl` (effect); plus the system
`@index`.

### `@index`

Returns the 0-based index of the current item during list-template rendering;
add `offset` for 1-based numbering. Only valid in a collection scope — error
otherwise. It is a system function (`@` prefix) available in every catalog.

### `formatString`

The only place `${expression}` is valid. Parse `${...}` blocks (handle `\${`
escapes), tokenize literals / data paths / function calls, resolve through the
data context to reactive streams, and concatenate with type coercion
(number/boolean → string; null/undefined → `""`; object/array → JSON).

### Validation and formatting functions

`required` (not null/undefined/empty), `regex` (`pattern` test), `length`
(min/max), `numeric` (range), `email` (standard email regex). `formatNumber` /
`formatCurrency` use native locale formatting; `formatDate` uses a Unicode
TR35 pattern; `pluralize` selects a localized string by numeric category.
`openUrl` is a side-effecting `void` function; `and` / `or` / `not` are
short-circuited boolean operators.

## Layout Spacing & Color

The v0.9 guidance still applies in v1.0:

- **Leaf-Margin strategy** — structural containers (`Row`, `Column`, `List`)
  contribute zero spacing; leaf and outlined components carry a uniform
  external margin. This keeps spacing predictable under deep nesting.
- **Color/contrast** — don't thread color through the tree; rely on native
  theme/context inheritance. Leaf `Text` / `Icon` never hardcode color unless a
  property says so. For nested containers, prefer transparent `Card`
  backgrounds with a 1dp outline.

---

Source: `specification/v1_0/docs/basic_catalog_implementation_guide.md` and
`specification/v1_0/catalogs/basic/catalog.json` in `a2ui-project/a2ui`.
