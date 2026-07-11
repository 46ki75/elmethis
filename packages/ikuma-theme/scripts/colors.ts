// Each color is a [dark, light] tuple. Edit either side to retint that variant.
export const palette = {
  // base16 -- UI scale
  // Light side mirrors dark: cool slate BG + cool slate FG progression, with
  // warm tan base04 providing temperature contrast against the surrounding slate.
  base00: ["#393e46", "#efecea"], // default background (editor)
  base01: ["#31353a", "#ebe6e2"], // lighter background (sidebar, tabs)
  base02: ["#242629", "#d9d3cc"], // status bar / deep background
  base03: ["#949ba7", "#a0aabb"], // comments
  base04: ["#aba294", "#a39984"], // dim foreground (status bar text)
  base05: ["#b0b5be", "#686e7a"], // default foreground, operators
  base06: ["#bec2ca", "#584f4f"], // light foreground
  base07: ["#cccfd5", "#383a3d"], // lightest foreground

  // base16 -- syntax accents
  base08: ["#b8aa8b", "#b5a78e"], // variables, tags
  base09: ["#b8a099", "#b35c46"], // numbers, constants
  base0A: ["#a87d62", "#ad592f96"], // classes, types
  base0B: ["#89a195", "#87a897"], // strings
  base0C: ["#59b5ac", "#2e8a80"], // support, regex, escapes
  base0D: ["#a8b891", "#6d9331"], // functions, methods
  base0E: ["#e1cb99", "#ba7f27"], // keywords, storage
  base0F: ["#ac8c71", "#ac8c71"], // deprecated, embedded tags

  // Extended accents
  bgBrightest: ["#454c58", "#c1c9d1"],
  primaryDimDim: ["#5c5346", "#c4b89c"],
  primaryDim: ["#867b64", "#a89878"],
  primary: ["#ad9f7d", "#7a6a45"],
  // One step brighter/lighter than primary -- for hover states. NOT the maximum-contrast accent.
  primaryHover: ["#c2b491", "#8b7a52"],
  // primaryBright = highest-contrast accent (light in dark mode, dark in light mode)
  primaryBright: ["#ece4d4", "#84661b"],
  secondaryDimDim: ["#453f39", "#dcd0b8"],
  secondaryDim: ["#63564a", "#b8a888"],
  crimson: ["#c56565", "#a04545"],
  emerald: ["#59b57c", "#2e8f53"],

  // ANSI terminal palette -- independent saturated rainbow, decoupled from the
  // warm UI palette so TUI output looks like a normal terminal.
  // Mapping (Solarized convention): orange -> ansiBrightRed, purple -> ansiBrightMagenta.
  // Dark values = user-specified; light values are ~30-40% darker for cream-bg legibility.
  ansiGray: ["#6c7079", "#888376"], // ansiBrightBlack
  ansiRed: ["#c56565", "#8a3535"],
  ansiOrange: ["#d48b70", "#b06548"], // ansiBrightRed
  ansiYellow: ["#cdb57b", "#8a6f30"],
  ansiYellowBright: ["#e0cb96", "#6e5a2a"],
  ansiGreen: ["#59b57c", "#2c7a4a"],
  ansiGreenBright: ["#82ba92", "#1a6b3a"],
  ansiCyan: ["#5fb5a8", "#2c7a72"], // not user-specified -- invented teal that fits the hue spread
  ansiCyanBright: ["#82d6cd", "#1a5b54"],
  ansiBlue: ["#6987b8", "#36568a"],
  ansiBlueBright: ["#8aa6d0", "#2c4670"],
  ansiPurple: ["#9771bd", "#5e3a8a"], // ansiBrightMagenta
  ansiMagenta: ["#c9699e", "#8a3a6a"],

  transparent: ["#00000000", "#00000000"],
} as const satisfies Record<string, readonly [string, string]>;

// Semantic aliases -- assign meaning to palette entries.
// Edit here to remap roles without touching the theme builder.
export const tokens = {
  // UI roles
  foreground: palette.base05,
  activeForeground: palette.primaryBright,
  secondaryForeground: palette.base04,
  ignored: palette.base04,
  faded: palette.base03,

  background: palette.base00,
  activeBackground: palette.base01,
  deepBackground: palette.base02,
  bgBrightest: palette.bgBrightest,
  border: palette.transparent,

  primary: palette.primary,
  primaryDim: palette.primaryDim,
  primaryDimDim: palette.primaryDimDim,
  primaryBright: palette.primaryBright,
  secondaryDim: palette.secondaryDim,
  secondaryDimDim: palette.secondaryDimDim,

  // Syntax roles (semantic + textmate share these)
  comment: palette.base03,
  string: palette.base0B,
  variable: palette.base05,
  parameter: palette.base05,
  property: palette.base08,
  keyword: palette.base0E,
  storage: palette.base0E,
  operator: palette.base05,
  punctuation: palette.base03,
  number: palette.base09,
  boolean: palette.base09,
  constant: palette.base09,
  function: palette.base0D,
  method: palette.base0D,
  class: palette.base0A,
  interface: palette.base0A,
  type: palette.base0A,
  typeParameter: palette.base0A,
  namespace: palette.base0A,
  enumMember: palette.base09,
  decorator: palette.base0D,
  regex: palette.base0C,
  builtin: palette.primaryBright,
  tag: palette.base08,
  attribute: palette.base08,

  // Status accents (UI: git, errors, warnings -- NOT terminal ANSI; that's in palette.ansi*)
  red: palette.crimson,
  green: palette.emerald,
  orange: palette.primaryBright,
  yellow: palette.base0E,
  blue: palette.primary,
  cyan: palette.base0C,
  magenta: palette.base0F,
} as const;
