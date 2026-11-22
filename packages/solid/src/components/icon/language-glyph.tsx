import { dynamic, type JSX } from "@solidjs/web";
import { createMemo, createUniqueId, For } from "solid-js";
import type { LanguageIcon, SvgNode } from "@elmethis/core";

export interface LanguageGlyphProps {
  icon: LanguageIcon;
  size?: number | string;
  class?: string;
  style?: JSX.CSSProperties | string;
}

const scopeId = (value: string, key: string, suffix: string): string =>
  key === "id"
    ? `${value}-${suffix}`
    : value.replace(/url\(#([^)]+)\)/g, `url(#$1-${suffix})`);

const renderNode = (node: SvgNode, suffix: string): JSX.Element => {
  const attrs: Record<string, string> = {};
  for (const [key, value] of Object.entries(node.attrs ?? {})) {
    attrs[key] = scopeId(value, key, suffix);
  }

  const Tag = dynamic(() => node.tag as keyof JSX.IntrinsicElements);
  return (
    <Tag {...attrs} style={node.style}>
      <For each={node.children}>{(child) => renderNode(child, suffix)}</For>
    </Tag>
  );
};

/** Renders core language artwork with gradient ids scoped per instance. */
export const LanguageGlyph = (props: LanguageGlyphProps) => {
  const suffix = createUniqueId();
  const rootAttrs = createMemo(() => props.icon.attrs ?? {});

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={props.icon.viewBox}
      width={props.size ?? 24}
      height={props.size ?? 24}
      class={props.class}
      style={props.style}
      {...rootAttrs()}
    >
      <For each={props.icon.children}>
        {(child) => renderNode(child, suffix)}
      </For>
    </svg>
  );
};
