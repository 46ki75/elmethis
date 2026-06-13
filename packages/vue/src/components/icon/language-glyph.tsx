import { defineComponent, h, useId, type PropType, type VNode } from "vue";
import type { LanguageIcon, SvgNode } from "@elmethis/core";

/** Rewrite in-document `id`s (and their `url(#id)` refs) with a unique suffix. */
const scopeId = (value: string, key: string, suffix: string): string =>
  key === "id"
    ? `${value}-${suffix}`
    : value.replace(/url\(#([^)]+)\)/g, `url(#$1-${suffix})`);

const renderNode = (node: SvgNode, suffix: string): VNode => {
  const attrs: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(node.attrs ?? {})) {
    attrs[k] = scopeId(v, k, suffix);
  }
  if (node.style) attrs.style = node.style;
  return h(
    node.tag,
    attrs,
    node.children?.map((child) => renderNode(child, suffix)),
  );
};

/**
 * Renders a framework-agnostic {@link LanguageIcon} from `@elmethis/core` into
 * an `<svg>`. Gradient ids are scoped per instance so repeated glyphs on one
 * page don't collide. `class`/`style` fall through onto the root `<svg>`.
 */
export const LanguageGlyph = defineComponent({
  name: "LanguageGlyph",
  props: {
    icon: { type: Object as PropType<LanguageIcon>, required: true },
    size: { type: [Number, String] as PropType<number | string>, default: 24 },
  },
  setup(props) {
    const suffix = useId().replace(/:/g, "");
    return () =>
      h(
        "svg",
        {
          xmlns: "http://www.w3.org/2000/svg",
          viewBox: props.icon.viewBox,
          width: props.size,
          height: props.size,
          ...props.icon.attrs,
        },
        props.icon.children.map((child) => renderNode(child, suffix)),
      );
  },
});
