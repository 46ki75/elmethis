/**
 * Design tokens for `@elmethis/core` — the single source of truth that the
 * vanilla-extract build (`scripts/build-tokens.ts`) emits to `dist/tokens.css`
 * as `--elmethis-*` custom properties. Mirrors the qwik reference
 * `packages/qwik/src/styles/global.css`: a primitive layer of concrete values
 * and a semantic layer that references it, themed natively via `light-dark()`.
 */

/** A primitive token knows the custom property that defines it. */
export interface PrimitiveToken {
  /** e.g. `--elmethis-primitive-color-blue-500` */
  readonly property: string;
  /** the literal value, e.g. `#68779f` */
  readonly value: string;
  /** a `var(--…)` reference for the semantic layer to consume */
  readonly ref: string;
}

/** A semantic token is either theme-independent or a `light-dark()` pair. */
export type SemanticValue =
  | { readonly common: string }
  | { readonly light: string; readonly dark: string };

// --- Primitive layer -------------------------------------------------------

const PRIMITIVE_VALUES = {
  color: {
    red: { 100: "#e9dddd", 500: "#ae6e6e", 900: "#291313" },
    orange: { 100: "#ebdfdb", 500: "#b8816e", 900: "#3f251c" },
    yellow: { 100: "#ebe6db", 500: "#b09a66", 900: "#332b19" },
    green: { 100: "#dde9e2", 500: "#659878", 900: "#15281d" },
    cyan: { 100: "#dde9e7", 500: "#6091a0", 900: "#203b37" },
    blue: { 100: "#dde2e9", 500: "#68779f", 900: "#242d3e" },
    purple: { 100: "#e3dde9", 500: "#8d799f", 900: "#271836" },
    magenta: { 100: "#eadce4", 500: "#b17396", 900: "#3c1f2f" },
    slate: {
      100: "#d7d9e1",
      200: "#b0b5be",
      300: "#949ba7",
      400: "#6c7483",
      500: "#555b67",
      600: "#40444c",
      700: "#393e46",
      800: "#31353a",
      900: "#242629",
    },
    gold: {
      100: "#f7f5f4",
      200: "#efecea",
      300: "#d9d3cc",
      400: "#cabfb2",
      500: "#c6b5a2",
      600: "#bda68b",
      700: "#a68c70",
      800: "#8e7356",
      900: "#6e583f",
    },
  },
  font: {
    family: {
      monospace:
        '"DM Mono", "Source Code Pro", Menlo, Consolas, "DejaVu Sans Mono", monospace',
    },
  },
} as const;

type PrimitiveTree<T> = {
  readonly [K in keyof T]: T[K] extends string
    ? PrimitiveToken
    : PrimitiveTree<T[K]>;
};

const makePrimitive = (
  path: readonly string[],
  value: string,
): PrimitiveToken => {
  const property = `--elmethis-primitive-${path.join("-")}`;
  return { property, value, ref: `var(${property})` };
};

const buildPrimitives = <T extends Record<string, unknown>>(
  values: T,
  path: readonly string[],
): PrimitiveTree<T> => {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(values)) {
    const next = [...path, key];
    out[key] =
      typeof value === "string"
        ? makePrimitive(next, value)
        : buildPrimitives(value as Record<string, unknown>, next);
  }
  return out as PrimitiveTree<T>;
};

/** Primitive tokens, addressable as `primitive.color.blue[500]`. */
export const primitive: PrimitiveTree<typeof PRIMITIVE_VALUES> =
  buildPrimitives(PRIMITIVE_VALUES, []);

// --- Semantic layer --------------------------------------------------------

type Ref = string | PrimitiveToken;
const resolve = (ref: Ref): string => (typeof ref === "string" ? ref : ref.ref);

/** A theme-independent semantic value. */
const common = (ref: Ref): SemanticValue => ({ common: resolve(ref) });
/** A native `light-dark()` semantic value. */
const theme = (light: Ref, dark: Ref): SemanticValue => ({
  light: resolve(light),
  dark: resolve(dark),
});

const { color, font } = primitive;

/**
 * Semantic tokens, keyed by the full kebab suffix that follows `--elmethis-`
 * (so `"color-accent-info-surface"` emits `--elmethis-color-accent-info-surface`).
 *
 * Flat keys keep a 1:1 mapping to the emitted CSS and sidestep the
 * leaf-vs-group ambiguity a nested tree creates for base/variant pairs — e.g.
 * `color-neutral` coexisting with `color-neutral-weak`. References to the
 * primitive layer are symbolic (`PrimitiveToken.ref`), never resolved values.
 */
export const semanticTokens = {
  "margin-block-start": common("2rem"),

  "font-family-monospace": common(font.family.monospace),

  "box-shadow-color": theme(
    "oklch(from #3e434b l c h / 0.25)",
    color.slate[900],
  ),

  // Accents
  "color-accent-link": common(color.blue[500]),
  "color-accent-link-visited": common(color.purple[500]),

  "color-accent-info": common(color.blue[500]),
  "color-accent-info-surface": theme(color.blue[100], color.blue[900]),

  "color-accent-success": common(color.green[500]),
  "color-accent-success-surface": theme(color.green[100], color.green[900]),

  "color-accent-important": common(color.purple[500]),
  "color-accent-important-surface": theme(color.purple[100], color.purple[900]),

  "color-accent-warning": common(color.yellow[500]),
  "color-accent-warning-surface": theme(color.yellow[100], color.yellow[900]),

  "color-accent-error": common(color.red[500]),
  "color-accent-error-surface": theme(color.red[100], color.red[900]),

  // Surfaces
  "color-surface-sunken": theme(color.gold[300], color.slate[800]),
  "color-surface-base": theme(color.gold[200], color.slate[700]),
  "color-surface-raised": theme(color.gold[100], color.slate[600]),

  // Neutral
  "color-neutral": theme(color.slate[400], color.slate[200]),
  "color-neutral-weak": common(color.slate[300]),
  "color-neutral-strong": theme(color.slate[500], color.slate[100]),

  // Primary
  "color-primary": theme(color.gold[700], color.gold[500]),
  "color-primary-weak": common(color.gold[600]),
  "color-primary-strong": theme(color.gold[800], color.gold[400]),
  "color-primary-hover": common(
    "oklch(from var(--elmethis-color-primary) l c h / 15%)",
  ),

  // Display
  "color-display-red": common(color.red[500]),
  "color-display-red-surface": theme(color.red[100], color.red[900]),

  "color-display-orange": common(color.orange[500]),
  "color-display-orange-surface": theme(color.orange[100], color.orange[900]),

  "color-display-yellow": common(color.yellow[500]),
  "color-display-yellow-surface": theme(color.yellow[100], color.yellow[900]),

  "color-display-green": common(color.green[500]),
  "color-display-green-surface": theme(color.green[100], color.green[900]),

  "color-display-cyan": common(color.cyan[500]),
  "color-display-cyan-surface": theme(color.cyan[100], color.cyan[900]),

  "color-display-blue": common(color.blue[500]),
  "color-display-blue-surface": theme(color.blue[100], color.blue[900]),

  "color-display-purple": common(color.purple[500]),
  "color-display-purple-surface": theme(color.purple[100], color.purple[900]),

  "color-display-magenta": common(color.magenta[500]),
  "color-display-magenta-surface": theme(
    color.magenta[100],
    color.magenta[900],
  ),
} satisfies Record<string, SemanticValue>;
