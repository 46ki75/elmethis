import { palette } from "./colors.ts";

type PaletteColor = keyof typeof palette;

function opaque(value: string) {
  return value.slice(0, 7);
}

function color(name: PaletteColor) {
  return {
    dark: opaque(palette[name][0]),
    light: opaque(palette[name][1]),
  };
}

function colorPair(dark: PaletteColor, light: PaletteColor) {
  return {
    dark: opaque(palette[dark][0]),
    light: opaque(palette[light][1]),
  };
}

function blend(background: string, foreground: string, alpha: number) {
  const rgb = (value: string) =>
    [1, 3, 5].map((offset) =>
      Number.parseInt(value.slice(offset, offset + 2), 16),
    );
  const [backgroundRed, backgroundGreen, backgroundBlue] = rgb(background);
  const [foregroundRed, foregroundGreen, foregroundBlue] = rgb(foreground);
  const channel = (backgroundChannel: number, foregroundChannel: number) =>
    Math.round(
      backgroundChannel + (foregroundChannel - backgroundChannel) * alpha,
    )
      .toString(16)
      .padStart(2, "0");

  return `#${channel(backgroundRed, foregroundRed)}${channel(backgroundGreen, foregroundGreen)}${channel(backgroundBlue, foregroundBlue)}`;
}

function diffBackground(name: PaletteColor) {
  const alpha = 0x30 / 0xff;
  return {
    dark: blend(opaque(palette.base00[0]), opaque(palette[name][0]), alpha),
    light: blend(opaque(palette.base00[1]), opaque(palette[name][1]), alpha),
  };
}

export function getOpenCodeTheme() {
  const background = color("base00");
  const panel = color("base01");
  const element = color("bgBrightest");
  const text = color("base05");
  const activeText = color("primaryBright");
  const muted = color("base04");
  const comment = color("base03");
  const primary = color("primary");
  const primaryDim = color("primaryDim");
  const primaryDimDim = color("primaryDimDim");
  const secondary = color("secondaryDim");
  const success = color("emerald");
  const error = color("crimson");
  const addedBackground = diffBackground("emerald");
  const removedBackground = diffBackground("crimson");

  return {
    $schema: "https://opencode.ai/theme.json",
    theme: {
      primary,
      secondary,
      accent: activeText,
      error,
      warning: colorPair("base0E", "primaryBright"),
      success,
      info: primary,
      text,
      textMuted: muted,
      background,
      backgroundPanel: panel,
      backgroundElement: element,
      border: primaryDimDim,
      borderActive: primary,
      borderSubtle: primaryDim,
      diffAdded: success,
      diffRemoved: error,
      diffContext: muted,
      diffHunkHeader: primary,
      diffHighlightAdded: success,
      diffHighlightRemoved: error,
      diffAddedBg: addedBackground,
      diffRemovedBg: removedBackground,
      diffContextBg: background,
      diffLineNumber: primaryDim,
      diffAddedLineNumberBg: addedBackground,
      diffRemovedLineNumberBg: removedBackground,
      markdownText: text,
      markdownHeading: activeText,
      markdownLink: primary,
      markdownLinkText: activeText,
      markdownCode: color("base0D"),
      markdownBlockQuote: comment,
      markdownEmph: color("base0E"),
      markdownStrong: activeText,
      markdownHorizontalRule: primaryDim,
      markdownListItem: primary,
      markdownListEnumeration: activeText,
      markdownImage: primary,
      markdownImageText: activeText,
      markdownCodeBlock: text,
      syntaxComment: comment,
      syntaxKeyword: color("base0E"),
      syntaxFunction: color("base0D"),
      syntaxVariable: text,
      syntaxString: color("base0B"),
      syntaxNumber: color("base09"),
      syntaxType: color("base0A"),
      syntaxOperator: text,
      syntaxPunctuation: comment,
    },
  };
}
