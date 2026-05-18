import {
  component$,
  PropsOf,
  Slot,
  type CSSProperties,
  type JSXOutput,
} from "@qwik.dev/core";

import styles from "./elm-inline-text.module.css";
import textStyles from "../../styles/text.module.css";

import { ElmInlineIcon } from "../icon/elm-inline-icon";

export interface ElmInlineTextProps extends PropsOf<"span"> {
  /**
   * Specifies the color of the text.
   *
   * e.g.) `'red'`, `'#ff0000'`, `'rgba(255, 0, 0, 0.5)'`
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

export const ElmInlineText = component$<ElmInlineTextProps>(
  ({
    class: className,
    style,
    color,
    size = "1em",
    backgroundColor,
    bold = false,
    italic = false,
    underline = false,
    strikethrough = false,
    code = false,
    kbd = false,
    ruby,
    href,
    favicon,
    ...rest
  }) => {
    let vnode: JSXOutput = <Slot />;

    if (href) {
      vnode = (
        <a
          class={styles.link}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
        >
          {favicon && <ElmInlineIcon src={favicon} alt="favicon" />}
          {vnode}
        </a>
      );
    }

    if (kbd) vnode = <kbd class={styles.kbd}>{vnode}</kbd>;
    if (strikethrough) vnode = <del>{vnode}</del>;
    if (italic) vnode = <em>{vnode}</em>;
    if (underline) vnode = <ins>{vnode}</ins>;
    if (bold) vnode = <strong>{vnode}</strong>;
    if (code) vnode = <code class={styles.code}>{vnode}</code>;

    if (ruby) {
      vnode = (
        <ruby class={styles.text}>
          <span>{vnode}</span>
          <rt>{ruby}</rt>
        </ruby>
      );
    }

    return (
      <span
        class={[styles.text, textStyles.text, className]}
        style={
          {
            ...(style as CSSProperties),
            "--color": color,
            "--font-size": size,
            "--background-color": backgroundColor,
          } as CSSProperties
        }
        {...rest}
      >
        {vnode}
      </span>
    );
  },
);
