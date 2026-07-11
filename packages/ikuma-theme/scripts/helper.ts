import { palette, tokens } from "./colors.ts";

export type ColorMode = "dark" | "light";

// Returns helpers bound to a single color mode.
//   v('keyword')       -> '#c9af70' (dark) or '#7a6010' (light)
//   v('primary', '40') -> '#ad9f7d40' (alpha-append)
//   p('base03')        -> raw palette access (skip semantic alias layer)
export function createTheme(mode: ColorMode) {
  const idx = mode === "dark" ? 0 : 1;

  const v = (key: keyof typeof tokens, op = ""): string =>
    tokens[key][idx] + op;

  const p = (key: keyof typeof palette, op = ""): string =>
    palette[key][idx] + op;

  return { v, p, mode };
}

type ThemeHelpers = ReturnType<typeof createTheme>;

// Build the 16 terminal.ansi* color entries. Keys are case-sensitive -- VS Code
// silently ignores anything spelled wrong.
// Pulls from palette.ansi* (independent rainbow palette), not the warm UI tokens.
export function buildAnsi({ p }: ThemeHelpers) {
  return {
    "terminal.ansiBlack": p("base02"),
    "terminal.ansiRed": p("ansiRed"),
    "terminal.ansiGreen": p("ansiGreen"),
    "terminal.ansiYellow": p("ansiYellow"),
    "terminal.ansiBlue": p("ansiBlue"),
    "terminal.ansiMagenta": p("ansiMagenta"),
    "terminal.ansiCyan": p("ansiCyan"),
    "terminal.ansiWhite": p("base05"),
    "terminal.ansiBrightBlack": p("ansiGray"),
    "terminal.ansiBrightRed": p("ansiOrange"),
    "terminal.ansiBrightGreen": p("ansiGreenBright"),
    "terminal.ansiBrightYellow": p("ansiYellowBright"),
    "terminal.ansiBrightBlue": p("ansiBlueBright"),
    "terminal.ansiBrightMagenta": p("ansiPurple"),
    "terminal.ansiBrightCyan": p("ansiCyanBright"),
    "terminal.ansiBrightWhite": p("base07"),
  };
}

// Windows Terminal color scheme. Flat JSON, 16 ANSI + bg/fg/cursor/selection.
// Note: WT spells the magenta slot "purple" (not "magenta").
export function buildWindowsTerminal({ p, v }: ThemeHelpers, name: string) {
  return {
    name,
    background: v("background"),
    foreground: v("foreground"),
    cursorColor: v("primaryBright"),
    selectionBackground: p("primary"),
    black: p("base02"),
    red: p("ansiRed"),
    green: p("ansiGreen"),
    yellow: p("ansiYellow"),
    blue: p("ansiBlue"),
    purple: p("ansiMagenta"),
    cyan: p("ansiCyan"),
    white: p("base05"),
    brightBlack: p("ansiGray"),
    brightRed: p("ansiOrange"),
    brightGreen: p("ansiGreenBright"),
    brightYellow: p("ansiYellowBright"),
    brightBlue: p("ansiBlueBright"),
    brightPurple: p("ansiPurple"),
    brightCyan: p("ansiCyanBright"),
    brightWhite: p("base07"),
  };
}
