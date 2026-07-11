# A2UI v0.9 — Basic Catalog Implementation Guide

This is the per-component implementation reference for renderer / client
developers targeting the v0.9 Basic Catalog. Use it when wiring framework
adapters (Layer 3 in `renderer-guide.md`) over the generic A2UI bindings —
it spells out expected visual behavior, suggested defaults, and interaction
patterns for each component and each built-in function.

## Table of Contents

- [Components](#components)
- [Client-Side Functions](#client-side-functions)
- [Layout Spacing — the Leaf-Margin Strategy](#layout-spacing--the-leaf-margin-strategy)
- [Color, Contrast, and Nesting](#color-contrast-and-nesting)

## Components

### Text

Displays text content; supports simple Markdown.

- Render through a Markdown parser when available. If it's unavailable or
  fails, fall back to the raw text — and ideally strip common Markdown
  markers (`**`, `#`) so legibility is preserved.
- Variants: `h1`–`h5` (suggested sizes 2.5x / 2x / 1.75x / 1.5x / 1.25x the
  base), `caption` (~0.8x base, lighter/italic), `body` (default).

### Image

Image from a URL. Default to flexible width filling the container.

- Map `fit` to the platform's content-scale mode (CSS `object-fit`, iOS
  `contentMode`, Android `ScaleType`).
- Variants: `icon` (~24x24dp square), `avatar` (small, rounded/circular),
  `smallFeature` (~100x100dp), `mediumFeature` (default, ~200x200dp or 100%
  width), `largeFeature` (large prominent), `header` (full-width banner with
  cover/crop scaling).

### Icon

System-provided icon by name. Map the `name` (e.g. `accountCircle`) to a
system icon set (Material Symbols, SF Symbols, …) — converting case as
needed (`account_circle`). Default size 24dp; inherit current text color.

### Video

Native video player with controls; full container width; support scrubbing
where the native control allows.

### AudioPlayer

Native audio player with controls; full container width; support scrubbing.

### Row

Horizontal layout (CSS flex row / Compose `Row` / SwiftUI `HStack`). Fill
available width.

- `justify` → main-axis (`justify-content` / `horizontalArrangement`):
  `start`, `center`, `end`, `spaceBetween`.
- `align` → cross-axis (`align-items` / `verticalAlignment`).

### Column

Vertical layout (CSS flex column / Compose `Column` / SwiftUI `VStack`).
Mirrors `Row` but `justify` is vertical, `align` is horizontal.

### List

Scrollable list.

- `direction` defaults to `vertical` (CSS `overflow-y: auto`, Compose
  `LazyColumn`, SwiftUI vertical `ScrollView`). For `horizontal`, hide the
  scrollbar where possible. Horizontal-list children typically need a
  bounded max width.

### Card

Container with card styling — distinct background, rounded corners (e.g.
8–12dp), subtle elevation/shadow, inner padding (~16dp).

**Card accepts exactly one child.** If the agent wants several elements
inside, wrap them in a `Column` (or `Row`).

### Tabs

Horizontal row of selectable headers above the active tab's child.

- Maintain a local `selectedIndex` (default `0`).
- On tap, update `selectedIndex` and render only that index's `child`.
- Visually indicate the active tab (bold, colored underline, …).

### Divider

- `axis: horizontal` (default) — 1dp tall, 100% width, subtle outline color.
- `axis: vertical` — 1dp wide, full container height.

### Modal

Dialog over the main content. Behaves as a **modal entry point**, not a
regular container:

- Render only the `trigger` child in the surface tree.
- When the user taps the trigger, open the modal and render the `content`
  child.
- Desktop: centered popup over a dimmed backdrop. Mobile: bottom sheet or
  full-screen dialog.
- Always provide a close mechanism (X button, backdrop tap, swipe-down).

### Button

Native button that dispatches an action when tapped.

- Always renders its `child` inside (typically a `Text` or `Icon`).
- Variants: `default` (subtle background + border), `primary` (use theme's
  `primaryColor` as background with contrasting text), `borderless` (no
  background or border, like a text link).
- Action context is resolved at the moment of interaction (so it reflects
  the user's latest inputs).

### TextField

Native text input. Establishes two-way binding — on each keystroke, write
the new string back to the bound `value` path.

- Variants: `shortText` (default single line), `longText` (multi-line),
  `number` (numeric keyboard), `obscured` (password/secure).

### CheckBox

Native checkbox/toggle alongside its label. Two-way bind boolean `true`/
`false` to the bound `value` path.

### ChoicePicker

Selects one or more options.

- `displayStyle: "checkbox"` (default) — dropdown / picker / expanding list.
  A dropdown wrapper is preferred for space.
- `displayStyle: "chips"` — horizontal wrapping row of selectable chips.
  Selected chips visually distinct.
- If `filterable: true`, render a search input over the option list;
  case-insensitive substring match on labels.
- Binds to an array of strings (the active selections).

### Slider

Native slider/seek bar. Optionally display the current value next to the
track.

- `min`/`max` set the range. The value is a `number` (not integer), so
  decimal ranges like 0.0–1.0 are valid.
- Two-way bind on drag.

### DateTimeInput

Native date/time picker.

- `enableDate` + `enableTime` → both pickers shown.
- `enableDate` only → date picker only.
- `enableTime` only → time picker only.

Write **ISO 8601 strings** to the data model (and parse ISO 8601 coming back
into the picker).

## Client-Side Functions

Most functions are pure logic — they take resolved args and return a value.
The Binder/Context layer wraps execution in a reactive stream so the
function re-runs when any dynamic argument changes. `formatString` is the
notable exception: it must parse its own expression string to find
dependencies, then build a reactive `computed`.

### `formatString`

The core interpolation engine; the only place `${expression}` syntax is
valid.

Implementation:

1. **Parse** the input for `${...}` blocks. Handle escapes (`\${` → literal
   `${`).
2. **Tokenize** inside an interpolation block:
   - **Literals** — quoted strings (`'...'` / `"..."`), numbers, `true` /
     `false` / `null`.
   - **Data paths** — start with `/` (absolute) or a bare identifier
     (relative within the current scope).
   - **Function calls** — identifier followed by `()` with named args.
3. **Resolve** each path/call through `DataContext.resolveSignal(token)` to
   get a reactive stream.
4. **Return** a `computed(() => ...)` that concatenates the resolved values
   with the literal text fragments, applying the type-coercion rules
   (number / boolean → string; null/undefined → `""`; object/array →
   JSON-stringify).

### `required`

Returns `true` if `args.value` is not `null`, not `undefined`, not `""`, and
not `[]`.

### `regex`

Compile `args.pattern` as a RegExp, test against `args.value`.

### `length`

True iff `args.value.length` is `>= args.min` (if provided) and `<= args.max`
(if provided).

### `numeric`

Parse `args.value` as a number; check it's in `[args.min, args.max]`. Return
`false` if it isn't a parseable number.

### `email`

Test against a standard email regex like `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`.

### `formatNumber`

Native locale formatting (`Intl.NumberFormat`, `NumberFormatter`). Apply
`args.decimals` as both min and max fraction digits. Enable grouping
unless `args.grouping: false`.

### `formatCurrency`

Like `formatNumber` but currency style, using ISO 4217 code from
`args.currency` (`USD`, `EUR`, …).

### `formatDate`

Parse `args.value` as a date/time; format using a Unicode TR35 pattern
(`yyyy-MM-dd`, `HH:mm`, …) — typically via a platform-specific date
library.

### `pluralize`

Resolve the plural category for `args.value` via `Intl.PluralRules` (or
equivalent). Map the resulting category (`zero` / `one` / `two` / `few` /
`many` / `other`) to the corresponding string in `args`. Fall back to
`args.other` if a category-specific string is missing.

### `openUrl`

Open `args.url` via the native URL handler. Returns `void`; runs as a
side-effect, only from user actions.

### `and` / `or` / `not`

Standard short-circuited boolean operators over `args.values` (or
`args.value` for `not`).

## Layout Spacing — the Leaf-Margin Strategy

A common pitfall in dynamic UI: nesting `Row` inside `Column` inside `Row`
accumulates padding/margins and the design feels "off." A2UI's recommended
strategy:

1. **Structural containers contribute zero spacing.** `Row`, `Column`,
   `List` get **no internal padding** and **no external margin**. They are
   pure structural boundaries — wrapping an element in a `Column` must not
   alter its spacing.
2. **Leaf components carry the margin.** `Text`, `Image`, `Icon`, `Video`,
   `AudioPlayer`, `Slider`, etc. apply a uniform external margin (e.g.
   `8dp` on all sides).
3. **Visually-outlined containers also carry margin.** `Card`, `Button`,
   `TextField`, `CheckBox`, `ChoicePicker` apply the same external margin.
   They additionally need internal padding to keep content off their own
   borders, but that padding is local and doesn't affect the surrounding
   layout.

Margins-on-leaves (rather than padding/gap on parents) makes spacing
predictable under arbitrarily deep nesting: structural containers
contribute zero, so the same component always reserves the same space
regardless of how it's wrapped.

## Color, Contrast, and Nesting

Don't manually thread color properties down the A2UI tree. Use the native
framework's theme/context inheritance instead.

### Text & Icon contrast

A `primary` `Button` defines its own background color; it must also publish
the expected foreground color so nested `Text` / `Icon` adapt automatically.

- **Web** — set CSS `color` on the button wrapper. CSS inheritance does the
  rest.
- **Compose (Android)** — `CompositionLocalProvider(LocalContentColor provides ...)`.
- **SwiftUI (iOS)** — `.foregroundColor(...)` or
  `.environment(\.colorScheme, ...)` on the button wrapper.
- **Flutter** — `DefaultTextStyle.merge()` + `IconTheme.merge()`. With
  Material buttons this is often automatic.

Rule of thumb: **leaf `Text` and `Icon` components never hardcode color
unless explicitly instructed by a property** — they inherit from their
environment.

### Nested containers (Cards inside Cards)

Trying to alternate surface colors by depth is messy. Simplest robust
default:

- Give `Card` a **transparent background** and a **visible 1dp outline** in
  the theme's outline color.
- Borders compose cleanly under arbitrary nesting — nested cards just draw
  an inner boundary inside the parent.
- If your design system requires opaque cards, use the framework's
  elevation/tint system (Material elevation, SwiftUI's `Material`, …)
  rather than coding depth-aware color logic into the A2UI adapters.

---

Source: `submodules/A2UI/specification/v0_9/docs/basic_catalog_implementation_guide.md`.
