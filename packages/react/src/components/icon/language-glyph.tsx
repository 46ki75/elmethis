import {
  createElement,
  useId,
  type CSSProperties,
  type ReactNode,
} from "react";
import type { LanguageIcon, SvgNode } from "@elmethis/core";

export interface LanguageGlyphProps {
  icon: LanguageIcon;
  size?: number | string;
  className?: string;
  style?: CSSProperties;
}

/** SVG presentation attributes are camelCase in React (`fill-rule` → `fillRule`). */
const toReactAttr = (name: string): string =>
  name.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());

/** Rewrite in-document `id`s (and their `url(#id)` refs) with a unique suffix. */
const scopeId = (value: string, key: string, suffix: string): string =>
  key === "id"
    ? `${value}-${suffix}`
    : value.replace(/url\(#([^)]+)\)/g, `url(#$1-${suffix})`);

const renderNode = (node: SvgNode, suffix: string, key: number): ReactNode => {
  const props: Record<string, unknown> = { key };
  for (const [k, v] of Object.entries(node.attrs ?? {})) {
    props[toReactAttr(k)] = scopeId(v, k, suffix);
  }
  if (node.style) props.style = node.style;
  const children = node.children?.map((child, i) =>
    renderNode(child, suffix, i),
  );
  return createElement(node.tag, props, children);
};

/**
 * Renders a framework-agnostic {@link LanguageIcon} from `@elmethis/core` into
 * an `<svg>`. Gradient ids are scoped per instance so repeated glyphs on one
 * page don't collide.
 */
export const LanguageGlyph = ({
  icon,
  size = 24,
  className,
  style,
}: LanguageGlyphProps) => {
  const suffix = useId().replace(/:/g, "");
  const rootAttrs: Record<string, string> = {};
  for (const [k, v] of Object.entries(icon.attrs ?? {})) {
    rootAttrs[toReactAttr(k)] = v;
  }
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={icon.viewBox}
      width={size}
      height={size}
      className={className}
      style={style}
      {...rootAttrs}
    >
      {icon.children.map((child, i) => renderNode(child, suffix, i))}
    </svg>
  );
};
