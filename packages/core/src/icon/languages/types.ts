/**
 * Framework-agnostic description of a language glyph's SVG artwork.
 *
 * Each {@link LanguageIcon} is authored once here and rendered by a thin,
 * per-framework component that walks the node tree into that framework's JSX.
 * The geometry (path data, gradients, brand colors) lives in exactly one place
 * so the `qwik`/`react`/`vue` libraries no longer duplicate it.
 */

/** A single SVG element node: a tag, its literal attributes, and children. */
export interface SvgNode {
  tag: string;
  attrs?: Record<string, string>;
  /**
   * Inline style. Used for theme-aware fills that can't be a static
   * presentation attribute (e.g. `fill: light-dark(...)`).
   */
  style?: Record<string, string>;
  children?: SvgNode[];
}

/** A complete language glyph: the root `<svg>` payload minus sizing props. */
export interface LanguageIcon {
  /** The `viewBox` of the root `<svg>`. */
  viewBox: string;
  /** Literal attributes carried on the root `<svg>` (e.g. a shared `fill`). */
  attrs?: Record<string, string>;
  /** The glyph's child elements. */
  children: SvgNode[];
}
