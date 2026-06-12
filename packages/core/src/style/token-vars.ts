import { primitive, semanticTokens, type PrimitiveToken } from "./token";

/**
 * Projects the design tokens into the ordered `--elmethis-*` custom-property
 * map for vanilla-extract's `globalStyle({ vars })` (primitive layer first,
 * then semantic). Primitive references and `light-dark()` theming are carried
 * by the token definitions themselves, so this is a plain projection — no name
 * munging and no value lookups.
 */

const isPrimitiveToken = (node: unknown): node is PrimitiveToken =>
  typeof node === "object" && node !== null && "property" in node;

const collectPrimitives = (
  node: Record<string, unknown>,
  out: Record<string, string>,
): void => {
  for (const child of Object.values(node)) {
    if (isPrimitiveToken(child)) {
      out[child.property] = child.value;
    } else {
      collectPrimitives(child as Record<string, unknown>, out);
    }
  }
};

export const tokenVars: Record<string, string> = (() => {
  const vars: Record<string, string> = {};
  collectPrimitives(primitive, vars);
  for (const [suffix, token] of Object.entries(semanticTokens)) {
    vars[`--elmethis-${suffix}`] =
      "common" in token
        ? token.common
        : `light-dark(${token.light}, ${token.dark})`;
  }
  return vars;
})();
