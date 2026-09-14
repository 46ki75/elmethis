import { buildAnsi, createTheme, type ColorMode } from "./helper.ts";

interface Highlight {
  fg?: string;
  bg?: string;
  sp?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  undercurl?: boolean;
  strikethrough?: boolean;
  link?: string;
}

// nvim_set_hl accepts RGB, not RGBA. Composite translucent tokens in sRGB
// against the editor background, matching the shared theme's overlays.
function opaqueColor(color: string, background: string): string {
  if (/^#[\da-f]{6}$/iu.test(color)) {
    return color;
  }
  if (!/^#[\da-f]{8}$/iu.test(color)) {
    throw new Error(`Invalid Neovim theme color: ${color}`);
  }

  const alpha = Number.parseInt(color.slice(7, 9), 16) / 255;
  const channels = [1, 3, 5].map((offset) => {
    const foreground = Number.parseInt(color.slice(offset, offset + 2), 16);
    const behind = Number.parseInt(background.slice(offset, offset + 2), 16);
    return Math.round(foreground * alpha + behind * (1 - alpha))
      .toString(16)
      .padStart(2, "0");
  });
  return `#${channels.join("")}`;
}

function getVariant(mode: ColorMode) {
  const helpers = createTheme(mode);
  const background = helpers.v("background");
  const v: typeof helpers.v = (key, opacity) =>
    opaqueColor(helpers.v(key, opacity), background);

  const highlights: Record<string, Highlight> = {
    Normal: { fg: v("foreground"), bg: background },
    NormalNC: { link: "Normal" },
    NormalFloat: { fg: v("foreground"), bg: v("activeBackground") },
    FloatBorder: { fg: v("primaryDim"), bg: v("activeBackground") },
    FloatTitle: {
      fg: v("primaryBright"),
      bg: v("activeBackground"),
      bold: true,
    },
    FloatFooter: { fg: v("secondaryForeground"), bg: v("activeBackground") },
    WinSeparator: { fg: v("primaryDimDim") },
    LineNr: { fg: v("ignored") },
    LineNrAbove: { link: "LineNr" },
    LineNrBelow: { link: "LineNr" },
    CursorLineNr: { fg: v("activeForeground"), bold: true },
    CursorLine: { bg: v("activeBackground") },
    CursorColumn: { link: "CursorLine" },
    ColorColumn: { bg: v("activeBackground") },
    SignColumn: { fg: v("secondaryForeground"), bg: background },
    CursorLineSign: { link: "SignColumn" },
    FoldColumn: { link: "SignColumn" },
    CursorLineFold: { link: "FoldColumn" },
    Folded: { fg: v("secondaryForeground"), bg: v("primary", "10") },
    Cursor: { fg: background, bg: v("primaryBright") },
    lCursor: { link: "Cursor" },
    CursorIM: { link: "Cursor" },
    TermCursor: { link: "Cursor" },
    Visual: { bg: v("primary", "40") },
    VisualNOS: { link: "Visual" },
    Search: { fg: v("activeForeground"), bg: v("primary", "44") },
    IncSearch: { fg: background, bg: v("primaryBright") },
    CurSearch: { link: "IncSearch" },
    Substitute: { link: "IncSearch" },
    MatchParen: { bg: v("primary", "40"), bold: true },
    StatusLine: { fg: v("primaryBright"), bg: v("deepBackground") },
    StatusLineNC: { fg: v("secondaryForeground"), bg: v("deepBackground") },
    StatusLineTerm: { link: "StatusLine" },
    StatusLineTermNC: { link: "StatusLineNC" },
    WinBar: { fg: v("foreground"), bg: v("activeBackground") },
    WinBarNC: { fg: v("secondaryForeground"), bg: v("activeBackground") },
    TabLine: { fg: v("secondaryForeground"), bg: v("activeBackground") },
    TabLineFill: { bg: v("activeBackground") },
    TabLineSel: { fg: v("activeForeground"), bg: background, bold: true },
    Pmenu: { fg: v("foreground"), bg: v("activeBackground") },
    PmenuSel: { fg: v("primaryBright"), bg: v("primaryDimDim") },
    PmenuSbar: { bg: v("deepBackground") },
    PmenuThumb: { bg: v("primaryDim") },
    PmenuMatch: { fg: v("primary"), bold: true },
    PmenuMatchSel: { fg: v("primaryBright"), bold: true },
    WildMenu: { link: "PmenuSel" },
    Title: { fg: v("primary"), bold: true },
    Directory: { fg: v("primary") },
    EndOfBuffer: { fg: v("primaryDimDim") },
    NonText: { fg: v("primaryDim", "60") },
    Whitespace: { fg: v("primaryDim", "20") },
    SpecialKey: { link: "NonText" },
    Conceal: { fg: v("faded") },
    Question: { fg: v("green") },
    MoreMsg: { fg: v("green") },
    ModeMsg: { fg: v("primaryBright"), bold: true },
    ErrorMsg: { fg: v("red") },
    WarningMsg: { fg: v("orange") },
    MsgArea: { link: "Normal" },
    MsgSeparator: { fg: v("primaryDim"), bg: v("deepBackground") },
    DiffAdd: { bg: v("green", "30") },
    DiffChange: { bg: v("blue", "22") },
    DiffDelete: { fg: v("red"), bg: v("red", "30") },
    DiffText: { bg: v("blue", "44") },
    Added: { fg: v("green") },
    Changed: { fg: v("orange") },
    Removed: { fg: v("red") },
    SpellBad: { sp: v("red"), undercurl: true },
    SpellCap: { sp: v("orange"), undercurl: true },
    SpellLocal: { sp: v("blue"), undercurl: true },
    SpellRare: { sp: v("green"), undercurl: true },
    QuickFixLine: { link: "PmenuSel" },
    Comment: { fg: v("comment"), italic: true },
    SpecialComment: { link: "Comment" },
    Todo: { fg: v("primaryBright"), bg: v("primaryDimDim"), bold: true },
    Underlined: { fg: v("secondaryForeground"), underline: true },
    Bold: { bold: true },
    Italic: { italic: true },
    LspReferenceText: { bg: v("primary", "22") },
    LspReferenceRead: { link: "LspReferenceText" },
    LspReferenceWrite: { bg: v("primary", "33") },
    LspReferenceTarget: { link: "LspReferenceText" },
    LspInlayHint: { fg: v("punctuation"), bg: v("activeBackground") },
    LspCodeLens: { fg: v("faded") },
    LspCodeLensSeparator: { link: "LspCodeLens" },
    LspSignatureActiveParameter: { bg: v("primary", "33"), bold: true },
    DiagnosticDeprecated: { strikethrough: true },
    DiagnosticUnnecessary: { fg: v("faded") },
    "@comment": { link: "Comment" },
    "@comment.error": { link: "DiagnosticError" },
    "@comment.warning": { link: "DiagnosticWarn" },
    "@comment.todo": { link: "Todo" },
    "@comment.note": { link: "DiagnosticInfo" },
    "@markup.strong": { bold: true },
    "@markup.italic": { italic: true },
    "@markup.strikethrough": { strikethrough: true },
    "@markup.underline": { underline: true },
    "@markup.heading": { link: "Title" },
    "@markup.link": { link: "Underlined" },
    "@markup.link.url": { link: "Underlined" },
    "@string.special.url": { link: "Underlined" },
    "@diff.plus": { link: "Added" },
    "@diff.minus": { link: "Removed" },
    "@diff.delta": { link: "Changed" },
    "@lsp.type.comment": { link: "Comment" },
    "@lsp.mod.deprecated": { strikethrough: true },
    "@lsp.mod.async": { italic: true },
  };

  const syntaxTokens = {
    Constant: "constant",
    String: "string",
    Character: "string",
    Number: "number",
    Boolean: "boolean",
    Float: "number",
    Identifier: "variable",
    Function: "function",
    Statement: "keyword",
    Conditional: "keyword",
    Repeat: "keyword",
    Label: "property",
    Operator: "operator",
    Keyword: "keyword",
    Exception: "keyword",
    PreProc: "keyword",
    Include: "keyword",
    Define: "keyword",
    Macro: "function",
    PreCondit: "keyword",
    Type: "type",
    StorageClass: "storage",
    Structure: "class",
    Typedef: "type",
    Special: "regex",
    SpecialChar: "regex",
    Tag: "tag",
    Delimiter: "punctuation",
    Debug: "red",
    Ignore: "ignored",
    Error: "red",
    "@variable": "variable",
    "@variable.builtin": "builtin",
    "@variable.parameter": "parameter",
    "@variable.parameter.builtin": "builtin",
    "@variable.member": "property",
    "@constant": "constant",
    "@constant.builtin": "constant",
    "@constant.macro": "constant",
    "@module": "namespace",
    "@module.builtin": "builtin",
    "@label": "property",
    "@string": "string",
    "@string.regexp": "regex",
    "@string.escape": "regex",
    "@string.special": "regex",
    "@string.special.symbol": "string",
    "@character": "string",
    "@character.special": "regex",
    "@boolean": "boolean",
    "@number": "number",
    "@number.float": "number",
    "@type": "type",
    "@type.builtin": "builtin",
    "@type.definition": "type",
    "@attribute": "decorator",
    "@attribute.builtin": "builtin",
    "@property": "property",
    "@function": "function",
    "@function.builtin": "builtin",
    "@function.call": "function",
    "@function.macro": "function",
    "@function.method": "method",
    "@function.method.call": "method",
    "@constructor": "class",
    "@operator": "operator",
    "@keyword": "keyword",
    "@keyword.operator": "operator",
    "@punctuation": "punctuation",
    "@punctuation.delimiter": "punctuation",
    "@punctuation.bracket": "punctuation",
    "@punctuation.special": "punctuation",
    "@markup.quote": "interface",
    "@markup.math": "constant",
    "@markup.link.label": "primary",
    "@markup.raw": "primary",
    "@markup.list": "punctuation",
    "@markup.list.checked": "green",
    "@markup.list.unchecked": "ignored",
    "@tag": "tag",
    "@tag.builtin": "tag",
    "@tag.attribute": "attribute",
    "@tag.delimiter": "punctuation",
    "@lsp.type.class": "class",
    "@lsp.type.decorator": "decorator",
    "@lsp.type.enum": "type",
    "@lsp.type.enumMember": "enumMember",
    "@lsp.type.event": "function",
    "@lsp.type.function": "function",
    "@lsp.type.interface": "interface",
    "@lsp.type.keyword": "keyword",
    "@lsp.type.macro": "function",
    "@lsp.type.method": "method",
    "@lsp.type.namespace": "namespace",
    "@lsp.type.number": "number",
    "@lsp.type.operator": "operator",
    "@lsp.type.parameter": "parameter",
    "@lsp.type.property": "property",
    "@lsp.type.regexp": "regex",
    "@lsp.type.string": "string",
    "@lsp.type.struct": "type",
    "@lsp.type.type": "type",
    "@lsp.type.typeParameter": "typeParameter",
    "@lsp.type.variable": "variable",
    "@lsp.mod.defaultLibrary": "builtin",
    "@lsp.typemod.variable.readonly": "constant",
    "@lsp.typemod.property.readonly": "constant",
  } as const;

  for (const [group, token] of Object.entries(syntaxTokens)) {
    highlights[group] = { fg: v(token) };
  }

  const diagnostics = {
    Error: "red",
    Warn: "orange",
    Info: "blue",
    Hint: "green",
    Ok: "green",
  } as const;

  for (const [severity, token] of Object.entries(diagnostics)) {
    highlights[`Diagnostic${severity}`] = { fg: v(token) };
    highlights[`DiagnosticSign${severity}`] = {
      link: `Diagnostic${severity}`,
    };
    highlights[`DiagnosticFloating${severity}`] = {
      link: `Diagnostic${severity}`,
    };
    highlights[`DiagnosticVirtualText${severity}`] = {
      fg: v(token),
      bg: v(token, "10"),
    };
    highlights[`DiagnosticVirtualLines${severity}`] = {
      link: `Diagnostic${severity}`,
    };
    highlights[`DiagnosticUnderline${severity}`] = {
      sp: v(token),
      undercurl: true,
    };
  }

  return {
    highlights,
    terminal: Object.values(buildAnsi(helpers)).map((color) =>
      opaqueColor(color, background),
    ),
  };
}

function renderVariant(mode: ColorMode): string[] {
  const { highlights, terminal } = getVariant(mode);
  return [
    "  highlights = {",
    ...Object.entries(highlights).map(([group, definition]) => {
      const fields = Object.entries(definition).map(
        ([key, value]) => `${key} = ${JSON.stringify(value)}`,
      );
      return `    [${JSON.stringify(group)}] = { ${fields.join(", ")} },`;
    }),
    "  }",
    "  terminal = {",
    ...terminal.map((color) => `    ${JSON.stringify(color)},`),
    "  }",
  ];
}

export function getNeovimTheme(): string {
  return [
    "-- Generated by ikuma-theme. Edit scripts/colors.ts and rebuild.",
    'vim.cmd("highlight clear")',
    'vim.g.colors_name = "ikuma"',
    "",
    "local highlights",
    "local terminal",
    "",
    'if vim.o.background == "light" then',
    ...renderVariant("light"),
    "else",
    ...renderVariant("dark"),
    "end",
    "",
    'vim.api.nvim_set_hl(0, "Normal", highlights.Normal)',
    "highlights.Normal = nil",
    "for group, definition in pairs(highlights) do",
    "  vim.api.nvim_set_hl(0, group, definition)",
    "end",
    "",
    "for index, color in ipairs(terminal) do",
    '  vim.g["terminal_color_" .. (index - 1)] = color',
    "end",
    "",
  ].join("\n");
}
