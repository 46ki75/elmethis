import { defineComponent, type CSSProperties, type HTMLAttributes } from "vue";
import { clsx } from "clsx";

import styles from "./elm-heading.module.css";
import textStyles from "../../styles/text.module.css";
import { ElmFragmentIdentifier } from "./elm-fragment-identifier";

export interface ElmHeadingProps extends HTMLAttributes {
  level: 1 | 2 | 3 | 4 | 5 | 6;

  text?: string;

  /** Anchor id; when present a fragment-identifier link is rendered. */
  id?: string;
}

const SIZE_MAP: Record<1 | 2 | 3 | 4 | 5 | 6, number> = Object.freeze({
  1: 1.5,
  2: 1.4,
  3: 1.3,
  4: 1.2,
  5: 1.15,
  6: 1.1,
} as const);

export const ElmHeading = defineComponent({
  name: "ElmHeading",
  props: {
    level: { type: Number as () => 1 | 2 | 3 | 4 | 5 | 6, required: true },
    text: { type: String, default: undefined },
    // `id` is read to drive the fragment-identifier anchor, so it is a declared
    // prop (applied explicitly onto the tag) rather than a fallthrough attr.
    id: { type: String, default: undefined },
  },
  setup(props, { slots }) {
    // inheritAttrs default: passthrough class/style merge onto the root tag.
    return () => {
      const Tag = `h${props.level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

      return (
        <Tag
          class={clsx(
            styles["elm-heading"],
            textStyles.text,
            styles[`h${props.level}`],
          )}
          style={
            {
              "--elmethis-scoped-font-size": `${SIZE_MAP[props.level]}em`,
            } as CSSProperties
          }
          id={props.id}
        >
          <span>{props.text}</span>
          {slots.default?.()}
          {props.id && (
            <span style={{ padding: "0.5rem" }}>
              <ElmFragmentIdentifier id={props.id} />
            </span>
          )}

          {props.level === 2 && (
            <span class={styles["h2-underline"]} aria-hidden="true"></span>
          )}
        </Tag>
      );
    };
  },
});
