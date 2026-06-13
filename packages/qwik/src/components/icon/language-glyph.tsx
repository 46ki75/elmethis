import {
  component$,
  useId,
  type CSSProperties,
  type JSXOutput,
} from "@qwik.dev/core";
import type { LanguageIcon, SvgNode } from "@elmethis/core";

export interface LanguageGlyphProps {
  icon: LanguageIcon;
  size?: number | string;
  class?: string;
  style?: CSSProperties;
}

/** Rewrite in-document `id`s (and their `url(#id)` refs) with a unique suffix. */
const scopeId = (value: string, key: string, suffix: string): string =>
  key === "id"
    ? `${value}-${suffix}`
    : value.replace(/url\(#([^)]+)\)/g, `url(#$1-${suffix})`);

const renderNode = (node: SvgNode, suffix: string, key: number): JSXOutput => {
  const attrs: Record<string, string> = {};
  for (const [k, v] of Object.entries(node.attrs ?? {})) {
    attrs[k] = scopeId(v, k, suffix);
  }
  // A capitalized binding holding a tag string renders an intrinsic element.
  const Tag = node.tag as unknown as "svg";
  return (
    <Tag key={key} {...attrs} style={node.style}>
      {node.children?.map((child, i) => renderNode(child, suffix, i))}
    </Tag>
  );
};

/**
 * Renders a framework-agnostic {@link LanguageIcon} from `@elmethis/core` into
 * an `<svg>`. Gradient ids are scoped per instance so repeated glyphs on one
 * page don't collide.
 */
export const LanguageGlyph = component$<LanguageGlyphProps>(
  ({ icon, size = 24, class: className, style }) => {
    const suffix = useId();
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={icon.viewBox}
        width={size}
        height={size}
        class={className}
        style={style}
        {...icon.attrs}
      >
        {icon.children.map((child, i) => renderNode(child, suffix, i))}
      </svg>
    );
  },
);
