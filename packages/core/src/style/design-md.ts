import { stringify } from "yaml";

import {
  primitive,
  semanticTokens,
  type PrimitiveToken,
  type SemanticValue,
} from "./token";

export type DesignTheme = "light" | "dark";

const SEMANTIC_PROPERTY_PREFIX = "--elmethis-";
const CSS_VAR_PATTERN = /var\((--elmethis-[a-z0-9-]+)\)/g;
const RELATIVE_ALPHA_PATTERN =
  /^oklch\(from (#[0-9a-f]{3}|#[0-9a-f]{6}|black|white) l c h \/ (\d+(?:\.\d+)?)(%)?\)$/i;

const primitiveValues = new Map<string, string>();

const isPrimitiveToken = (value: unknown): value is PrimitiveToken =>
  typeof value === "object" &&
  value !== null &&
  "property" in value &&
  "value" in value &&
  "ref" in value;

const collectPrimitiveValues = (node: Record<string, unknown>): void => {
  for (const value of Object.values(node)) {
    if (isPrimitiveToken(value)) {
      primitiveValues.set(value.property, value.value);
    } else {
      collectPrimitiveValues(value as Record<string, unknown>);
    }
  }
};

collectPrimitiveValues(primitive);

const semanticTokenMap = new Map<string, SemanticValue>(
  Object.entries(semanticTokens),
);

const withAlpha = (color: string, percentage: number): string => {
  const namedColor =
    color.toLowerCase() === "black"
      ? "#000000"
      : color.toLowerCase() === "white"
        ? "#ffffff"
        : color;
  const compact = namedColor.slice(1).toLowerCase();
  const rgb = compact.length === 3 ? compact.replace(/./g, "$&$&") : compact;

  if (!namedColor.startsWith("#") || rgb.length !== 6) {
    throw new Error(`Cannot apply alpha to unsupported color: ${color}`);
  }
  if (percentage < 0 || percentage > 100) {
    throw new Error(`Alpha percentage is outside 0-100: ${percentage}`);
  }

  const alpha = Math.round((percentage / 100) * 255)
    .toString(16)
    .padStart(2, "0");
  return `#${rgb}${alpha}`;
};

const resolveSemanticToken = (
  suffix: string,
  theme: DesignTheme,
  resolving: ReadonlySet<string> = new Set(),
): string => {
  if (resolving.has(suffix)) {
    throw new Error(`Circular semantic token reference: ${suffix}`);
  }

  const token = semanticTokenMap.get(suffix);
  if (!token) {
    throw new Error(`Unknown semantic token: ${suffix}`);
  }

  const nextResolving = new Set(resolving).add(suffix);
  const raw = "common" in token ? token.common : token[theme];
  const expanded = raw.replace(CSS_VAR_PATTERN, (_match, property: string) => {
    const primitiveValue = primitiveValues.get(property);
    if (primitiveValue !== undefined) {
      return primitiveValue;
    }

    if (!property.startsWith(SEMANTIC_PROPERTY_PREFIX)) {
      throw new Error(`Unsupported custom property reference: ${property}`);
    }
    return resolveSemanticToken(
      property.slice(SEMANTIC_PROPERTY_PREFIX.length),
      theme,
      nextResolving,
    );
  });
  const relativeAlpha = expanded.match(RELATIVE_ALPHA_PATTERN);

  return relativeAlpha
    ? withAlpha(
        relativeAlpha[1],
        Number(relativeAlpha[2]) * (relativeAlpha[3] === "%" ? 1 : 100),
      )
    : expanded;
};

const assertEverySemanticTokenIsHandled = (): void => {
  const handled = new Set([
    "stack-gap",
    "box-shadow-small",
    "box-shadow-medium",
    "box-shadow-large",
    "font-family-sans",
    "font-family-monospace",
    ...[...semanticTokenMap.keys()].filter((name) => name.startsWith("color-")),
  ]);
  const unhandled = [...semanticTokenMap.keys()].filter(
    (name) => !handled.has(name),
  );

  if (unhandled.length > 0) {
    throw new Error(
      `DESIGN.md generator does not classify semantic tokens: ${unhandled.join(", ")}`,
    );
  }
};

const buildBody = (theme: DesignTheme): string => {
  const label = theme === "light" ? "Light" : "Dark";
  const shadowSmall = resolveSemanticToken("box-shadow-small", theme);
  const shadowMedium = resolveSemanticToken("box-shadow-medium", theme);
  const shadowLarge = resolveSemanticToken("box-shadow-large", theme);

  return `# Elmethis ${label}

## Overview

Elmethis is a small, restrained design system for content-forward interfaces. This document resolves its semantic tokens for the ${theme} color scheme. Let an element's role determine its appearance; do not choose a hue before deciding what the element means.

The frontmatter values are design context, not application CSS. Implementations must use the matching \`--elmethis-*\` custom properties from \`@elmethis/core/tokens.css\` so they continue to follow the published theme.

## Colors

Choose color in this order: semantic role, display preset, then a primitive only when no public role applies. Primitive colors are deliberately absent from this document because appearance-based names are not stable component contracts.

- Use \`neutral\` for body text, \`neutral-weak\` for secondary text, and \`neutral-strong\` for headings and emphasis.
- Use \`surface-base\` for the page, \`surface-raised\` for containers, \`surface-sunken\` for inset regions, and \`divider\` for borders and separators.
- Pair each \`accent-{role}\` foreground with its \`accent-{role}-surface\`. Available roles are link, info, success, important, warning, and error.
- Reserve \`display-{color}\` and its matching surface for charts, legends, swatches, or content where the color itself is meaningful. Never substitute a display color for a semantic status.
- A frontmatter token such as \`surface-base\` maps to the CSS property \`--elmethis-color-surface-base\`.

## Typography

Use the sans family for interfaces and prose. Use monospace only for code, identifiers, and fixed-width data. Applications must reference \`--elmethis-font-family-sans\` and \`--elmethis-font-family-monospace\` rather than repeating the resolved stacks.

Elmethis core defines font families but not a universal size, weight, or line-height scale. Preserve the hierarchy of the host component or product instead of inventing a core typography scale.

## Layout

Use explicit layout containers and \`gap\` for rhythm between sibling blocks. The \`stack-gap\` token is the standard separation for Elmethis content stacks; do not emulate it with leading margins on leaf components.

Elmethis core does not prescribe a page grid or a complete spacing scale. Keep layouts responsive, preserve readable line lengths, and derive product-level spacing decisions consistently from the surrounding interface.

## Elevation & Depth

Prefer tonal surfaces and the \`divider\` token over shadows. When elevation is necessary, use the smallest shadow that communicates the relationship:

- Small: \`${shadowSmall}\`
- Medium: \`${shadowMedium}\`
- Large: \`${shadowLarge}\`

These resolved values correspond to \`--elmethis-box-shadow-small\`, \`--elmethis-box-shadow-medium\`, and \`--elmethis-box-shadow-large\`. Use those properties in CSS rather than copying the values.

## Shapes

Elmethis core intentionally defines no global corner-radius scale. Keep geometry restrained and component-specific. Do not impose pill shapes, excessive rounding, or a new universal radius without a product-level design requirement.

## Components

Build components from semantic roles: base and raised surfaces establish containment, dividers establish separation, neutral roles establish text hierarchy, and accent pairs establish interactive or status meaning.

Keep focus visible with a primary-colored outline. Pair status color with an icon or text label, and test content in both color schemes. Component implementations should consume the public CSS properties rather than the resolved literals in this file.

## Do's and Don'ts

- Do use semantic colors whenever a role fits.
- Do use matching accent foreground and surface pairs.
- Do reserve display colors for visualization and intentionally color-named content.
- Do prefer dividers and tonal surfaces over unnecessary elevation.
- Do test focus visibility, text contrast, status cues, and both color schemes.
- Don't copy resolved colors, font stacks, or shadows into application CSS.
- Don't use primitives where a semantic or display token applies.
- Don't communicate state through color alone.
- Don't add component-level light and dark overrides for behavior already provided by Elmethis tokens.
`;
};

export const generateDesignMd = (theme: DesignTheme): string => {
  assertEverySemanticTokenIsHandled();

  const label = theme === "light" ? "Light" : "Dark";
  const colors = Object.fromEntries(
    [...semanticTokenMap.keys()]
      .filter((name) => name.startsWith("color-"))
      .map((name) => [
        name.slice("color-".length),
        resolveSemanticToken(name, theme),
      ]),
  );
  const frontmatter = stringify(
    {
      version: "alpha",
      name: `Elmethis ${label}`,
      description: `Elmethis semantic design system resolved for the ${theme} color scheme.`,
      omitted: [
        {
          section: "rounded",
          reason:
            "@elmethis/core does not define a global corner-radius scale.",
        },
        {
          section: "components",
          reason:
            "Framework components consume shared semantic tokens but core defines no component-token map.",
        },
      ],
      colors,
      typography: {
        sans: {
          fontFamily: resolveSemanticToken("font-family-sans", theme),
        },
        monospace: {
          fontFamily: resolveSemanticToken("font-family-monospace", theme),
        },
      },
      spacing: {
        "stack-gap": resolveSemanticToken("stack-gap", theme),
      },
    },
    { lineWidth: 0 },
  );

  return `---\n${frontmatter}---\n\n${buildBody(theme)}`;
};
