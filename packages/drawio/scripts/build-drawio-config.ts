import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  primitive,
  semanticTokens,
  type PrimitiveToken,
} from "@elmethis/core/tokens";

const packageRoot = path.resolve(fileURLToPath(import.meta.url), "../..");
const outFile = path.join(packageRoot, "dist/draw.io-config.json");

const { color, font } = primitive;
const displayColors = [
  ["red", "Red", color.red],
  ["orange", "Orange", color.orange],
  ["yellow", "Yellow", color.yellow],
  ["green", "Green", color.green],
  ["cyan", "Cyan", color.cyan],
  ["blue", "Blue", color.blue],
  ["purple", "Purple", color.purple],
  ["magenta", "Magenta", color.magenta],
] as const;

/** Converts a hex primitive token into draw.io's hashless palette format. */
const paletteValue = (token: PrimitiveToken): string =>
  token.value.replace(/^#/, "");

const primitiveValues = new Map<string, string>();
/** Recursively indexes primitive token values by their CSS custom property. */
const collectPrimitiveValues = (node: Record<string, unknown>): void => {
  for (const child of Object.values(node)) {
    if (typeof child === "object" && child !== null && "property" in child) {
      const token = child as PrimitiveToken;
      primitiveValues.set(token.property, token.value);
    } else {
      collectPrimitiveValues(child as Record<string, unknown>);
    }
  }
};
collectPrimitiveValues(primitive);

/** Replaces primitive CSS variable references with their concrete token values. */
const resolvePrimitiveRefs = (cssValue: string): string =>
  cssValue.replace(
    /var\((--elmethis-primitive-[^)]+)\)/g,
    (ref: string, property: string) => {
      const resolved = primitiveValues.get(property);
      if (!resolved) {
        throw new Error(`Unknown primitive token reference: ${ref}`);
      }
      return resolved;
    },
  );

/** Resolves a semantic token into an adaptive CSS light-dark color. */
const semanticColor = (name: keyof typeof semanticTokens): string => {
  const token = semanticTokens[name];
  if ("common" in token) {
    const resolved = resolvePrimitiveRefs(token.common);
    return `light-dark(${resolved}, ${resolved})`;
  }
  return `light-dark(${resolvePrimitiveRefs(token.light)}, ${resolvePrimitiveRefs(token.dark)})`;
};

/** Resolves a semantic color that must have the same value in every theme. */
const commonSemanticColor = (name: keyof typeof semanticTokens): string => {
  const token = semanticTokens[name];
  if (!("common" in token)) {
    throw new Error(`Expected ${name} to be a theme-independent color`);
  }
  return resolvePrimitiveRefs(token.common);
};

/** Normalizes a CSS color into the key format expected by draw.io colorNames. */
const colorNameKey = (cssValue: string): string =>
  cssValue.replace(/^#/, "").toUpperCase();
const colorNames: Record<string, string> = {};
/** Registers a human-readable name for a draw.io color value. */
const addColorName = (cssValue: string, name: string): void => {
  colorNames[colorNameKey(cssValue)] = name;
};

for (const [scale, token] of Object.entries(color.slate)) {
  addColorName(token.value, `Slate ${scale}`);
}
for (const [scale, token] of Object.entries(color.gold)) {
  addColorName(token.value, `Gold ${scale}`);
}
for (const [name, label, scale] of displayColors) {
  for (const [step, token] of Object.entries(scale)) {
    addColorName(token.value, `${label} ${step}`);
  }
  addColorName(
    semanticColor(`color-display-${name}-surface`),
    `${label} Surface`,
  );
}

const namedSemanticColors = [
  ["color-neutral-weak", "Neutral Weak"],
  ["color-neutral", "Neutral"],
  ["color-neutral-strong", "Neutral Strong"],
  ["color-primary-weak", "Primary Weak"],
  ["color-primary", "Primary"],
  ["color-primary-strong", "Primary Strong"],
  ["color-surface-sunken", "Surface Sunken"],
  ["color-surface-base", "Surface Base"],
  ["color-surface-raised", "Surface Raised"],
] as const satisfies readonly (readonly [
  keyof typeof semanticTokens,
  string,
])[];

for (const [token, label] of namedSemanticColors) {
  addColorName(semanticColor(token), label);
}

const fontFamilies = [...font.family.sans.value.matchAll(/"([^"]+)"/g)].map(
  (match) => match[1],
);
const webFontFamilies = fontFamilies.slice(0, 2);
const defaultFontFamily = font.family.sans.value;

if (webFontFamilies.length === 0) {
  throw new Error("The sans font token does not contain a quoted font family");
}

const fontDefinitions = webFontFamilies.map((fontFamily) => ({
  fontFamily,
  fontUrl: `https://fonts.googleapis.com/css?family=${fontFamily.replaceAll(" ", "+")}`,
}));
const defaultFontSource = encodeURIComponent(
  `https://fonts.googleapis.com/css?family=${webFontFamilies
    .map((fontFamily) => fontFamily.replaceAll(" ", "+"))
    .join("|")}`,
);
const gridColorToken = semanticTokens["color-divider"];

if (!("light" in gridColorToken)) {
  throw new Error("Expected color-divider to define light and dark colors");
}

const neutralColor = semanticColor("color-neutral");
const primaryColor = semanticColor("color-primary");
const raisedSurfaceColor = semanticColor("color-surface-raised");
const defaultTextStyle = [
  "text",
  "html=1",
  "whiteSpace=wrap",
  "strokeColor=none",
  "fillColor=none",
  "align=center",
  "verticalAlign=middle",
  "rounded=0",
  `fontFamily=${defaultFontFamily}`,
  "fontSize=16",
  `fontColor=${neutralColor}`,
  `fontSource=${defaultFontSource}`,
  "",
].join(";");

const config = {
  __README: [
    "Generated by @elmethis/draw.io from @elmethis/core design tokens.",
    "See https://www.drawio.com/docs/reference/configure-diagram-editor/",
  ],
  version: "elmethis-1",
  defaultAdaptiveColors: "simple",
  embedSvgFonts: true,

  shadowColor: "#000000",
  shadowOpacity: 0.1,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  shadowBlur: 2,

  styles: [
    {
      commonStyle: {
        fontColor: neutralColor,
        strokeColor: primaryColor,
        fillColor: raisedSurfaceColor,
      },
    },
  ],
  customColorSchemes: [
    [
      ...displayColors.flatMap(([name, label]) => {
        const base = commonSemanticColor(`color-display-${name}`);
        return [
          {
            title: `Display ${label}`,
            fill: base,
            stroke: base,
            font: base,
            border: "4px solid",
          },
          {
            title: `Display ${label} Surface`,
            fill: semanticColor(`color-display-${name}-surface`),
            stroke: base,
            font: base,
            border: "4px solid",
          },
          {
            title: `Display ${label} 20% Fill`,
            fill: `${base}33`,
            stroke: base,
            font: base,
            border: "4px solid",
          },
          {
            title: `Display ${label} Transparent Fill`,
            fill: "none",
            stroke: base,
            font: base,
            border: "4px solid",
          },
        ];
      }),

      {
        title: "Neutral Surface",
        fill: raisedSurfaceColor,
        stroke: neutralColor,
        font: neutralColor,
        border: "4px solid",
      },

      {
        title: "Accent Surface",
        fill: raisedSurfaceColor,
        stroke: primaryColor,
        font: neutralColor,
        border: "4px solid",
      },

      {
        title: "Default",
        fill: undefined,
        stroke: undefined,
        font: neutralColor,
        border: "4px solid",
      },
    ],
  ],
  presetColors: [
    semanticColor("color-neutral-weak"),
    semanticColor("color-neutral"),
    semanticColor("color-neutral-strong"),
    null,
    semanticColor("color-primary-weak"),
    semanticColor("color-primary"),
    semanticColor("color-primary-strong"),
    null,
    semanticColor("color-surface-sunken"),
    semanticColor("color-surface-base"),
    semanticColor("color-surface-raised"),
    null,
  ],
  defaultColors: [
    semanticColor("color-neutral-weak"),
    semanticColor("color-neutral"),
    semanticColor("color-neutral-strong"),
    ...Object.values(color.slate).map(paletteValue),
    semanticColor("color-primary-weak"),
    semanticColor("color-primary"),
    semanticColor("color-primary-strong"),
    ...Object.values(color.gold).map(paletteValue),
    ...displayColors.flatMap(([, , { 100: surface, 500: base, 900: dark }]) => [
      paletteValue(surface),
      paletteValue(base),
      paletteValue(dark),
    ]),
  ],
  colorNames,
  defaultFonts: fontDefinitions,
  defaultTextStyle,
  defaultVertexStyle: {
    fontFamily: defaultFontFamily,
    fontSize: "16",
    fontColor: neutralColor,
    fontSource: defaultFontSource,
    spacing: "8",
  },

  defaultEdgeStyle: {
    fontFamily: defaultFontFamily,
    fontSize: "16",
    fontColor: neutralColor,
    fontSource: defaultFontSource,
    strokeColor: neutralColor,
    startFillColor: neutralColor,
    endFillColor: neutralColor,

    sourcePerimeterSpacing: "8",
    targetPerimeterSpacing: "8",

    rounded: "1",
    jumpStyle: "gap",
    jumpSize: "8",
  },
};

if (config.presetColors.length !== 12) {
  throw new Error("draw.io presetColors must contain exactly 12 entries");
}

const output = `${JSON.stringify(config, null, 2)}\n`;

await mkdir(path.dirname(outFile), { recursive: true });
await writeFile(outFile, output);
console.log(
  `Wrote ${path.relative(packageRoot, outFile)} (${output.length} bytes)`,
);
