import {
  createMemo,
  createUniqueId,
  For,
  mergeProps,
  splitProps,
  type JSX,
} from "solid-js";
import { Dynamic } from "solid-js/web";
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

  return (
    <Dynamic
      component={node.tag as keyof JSX.IntrinsicElements}
      {...attrs}
      style={node.style}
    >
      <For each={node.children}>{(child) => renderNode(child, suffix)}</For>
    </Dynamic>
  );
};

/** Renders core language artwork with gradient ids scoped per instance. */
export const LanguageGlyph = (props: LanguageGlyphProps) => {
  const merged = mergeProps({ size: 24 }, props);
  const [local] = splitProps(merged, ["icon", "size", "class", "style"]);
  const suffix = createUniqueId();
  const rootAttrs = createMemo(() => local.icon.attrs ?? {});

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={local.icon.viewBox}
      width={local.size}
      height={local.size}
      class={local.class}
      style={local.style}
      {...rootAttrs()}
    >
      <For each={local.icon.children}>
        {(child) => renderNode(child, suffix)}
      </For>
    </svg>
  );
};
