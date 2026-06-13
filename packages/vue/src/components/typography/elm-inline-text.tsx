import {
  defineComponent,
  type CSSProperties,
  type HTMLAttributes,
  type StyleValue,
  type VNodeChild,
} from "vue";
import { clsx } from "clsx";

import styles from "./elm-inline-text.module.css";
import textStyles from "../../styles/text.module.css";

import { ElmInlineIcon } from "../icon/elm-inline-icon";

export interface ElmInlineTextProps extends HTMLAttributes {
  /**
   * Specifies the color of the text.
   *
   * Accepts any CSS color value, including theme tokens via `var(...)`.
   * Defaults to `var(--elmethis-color-neutral)` when omitted.
   *
   * e.g.) `'red'`, `'#ff0000'`, `'rgba(255, 0, 0, 0.5)'`,
   * `'var(--elmethis-color-primary)'`
   */
  color?: CSSProperties["color"];

  /**
   * Specifies the font size of the text.
   */
  size?: CSSProperties["fontSize"];

  /**
   * Specifies whether the text should be bold.
   */
  bold?: boolean;

  /**
   * Specifies whether the text should be italic.
   */
  italic?: boolean;

  /**
   * Specifies whether the text should be underlined.
   */
  underline?: boolean;

  /**
   * Specifies whether the text should be strikethrough.
   */
  strikethrough?: boolean;

  /**
   * Specifies whether the text should be displayed as code.
   */
  code?: boolean;

  /**
   * Specifies whether the text should be displayed as a keyboard key.
   */
  kbd?: boolean;

  /**
   * Specifies the background color of the text.
   */
  backgroundColor?: CSSProperties["backgroundColor"];

  /**
   * The ruby text to display.
   */
  ruby?: string;

  /**
   * The URL to navigate to.
   *
   * e.g. `https://example.com`
   */
  href?: string;

  /**
   * Optional favicon URL displayed alongside the link.
   */
  favicon?: string;
}

export const ElmInlineText = defineComponent({
  name: "ElmInlineText",
  // The custom props below are declared so Vue keeps them out of `attrs`; with
  // `inheritAttrs: false` the remaining native span attributes (id, title,
  // event listeners, …) are spread onto the root, while `class`/`style` are
  // merged explicitly.
  inheritAttrs: false,
  props: {
    // Runtime prop types stay as plain `String` (inferring `string`); the
    // richer `CSSProperties[...]` types are documented on `ElmInlineTextProps`.
    // Using csstype's types here makes vue-tsc's inferred component type
    // unnameable on emit (TS2883).
    color: { type: String, default: undefined },
    size: { type: String, default: "1em" },
    backgroundColor: { type: String, default: undefined },
    bold: { type: Boolean, default: false },
    italic: { type: Boolean, default: false },
    underline: { type: Boolean, default: false },
    strikethrough: { type: Boolean, default: false },
    code: { type: Boolean, default: false },
    kbd: { type: Boolean, default: false },
    ruby: { type: String, default: undefined },
    href: { type: String, default: undefined },
    favicon: { type: String, default: undefined },
  },
  setup(props, { attrs, slots }) {
    return () => {
      const {
        class: className,
        style,
        ...rest
      } = attrs as Record<string, unknown>;

      let vnode: VNodeChild = slots.default?.();

      if (props.href) {
        vnode = (
          <a
            class={styles.link}
            href={props.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {props.favicon && (
              <ElmInlineIcon src={props.favicon} alt="favicon" />
            )}
            {vnode}
          </a>
        );
      }

      if (props.kbd) vnode = <kbd class={styles.kbd}>{vnode}</kbd>;
      if (props.strikethrough) vnode = <del>{vnode}</del>;
      if (props.italic) vnode = <em>{vnode}</em>;
      if (props.underline) vnode = <ins>{vnode}</ins>;
      if (props.bold) vnode = <strong>{vnode}</strong>;
      if (props.code) vnode = <code class={styles.code}>{vnode}</code>;

      if (props.ruby) {
        vnode = (
          <ruby class={styles["elm-inline-text"]}>
            <span>{vnode}</span>
            <rt>{props.ruby}</rt>
          </ruby>
        );
      }

      return (
        <span
          class={clsx(
            styles["elm-inline-text"],
            textStyles.text,
            className as string | undefined,
          )}
          style={
            [
              style as StyleValue,
              {
                "--elmethis-scoped-color": props.color,
                "--elmethis-scoped-font-size": props.size,
                "--elmethis-scoped-background-color": props.backgroundColor,
              },
            ] as StyleValue
          }
          {...rest}
        >
          {vnode}
        </span>
      );
    };
  },
});
