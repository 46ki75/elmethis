import { component$, Slot, type CSSProperties } from "@builder.io/qwik";

import styles from "./elm-inline-text.module.scss";
import textStyles from "../../styles/text.module.scss";

import { ElmInlineIcon } from "../icon/elm-inline-icon";

export interface ElmInlineTextProps {
  /**
   * The text to display.
   */
  text?: string;

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

  favicon?: string;
}

export const ElmInlineText = component$<ElmInlineTextProps>((props) => {
  const {
    bold = false,
    italic = false,
    underline = false,
    strikethrough = false,
    code = false,
    size = "1em",
  } = props;

  let vnode = props.text ? <span>{props.text}</span> : <Slot />;

  if (props.kbd) {
    vnode = <kbd class={styles.kbd}>{vnode}</kbd>;
  }

  if (strikethrough) {
    vnode = <del>{vnode}</del>;
  }

  if (italic) {
    vnode = <em>{vnode}</em>;
  }

  if (underline) {
    vnode = <ins>{vnode}</ins>;
  }

  if (bold) {
    vnode = <strong>{vnode}</strong>;
  }

  if (code) {
    vnode = <code class={styles.code}>{vnode}</code>;
  }

  if (props.ruby) {
    vnode = (
      <ruby class={styles.text}>
        <span>{vnode}</span>
        <rt>{props.ruby}</rt>
      </ruby>
    );
  }

  const wrappedVnode = (
    <span
      class={[styles.text, textStyles.text]}
      style={{
        "--color": props.color,
        "--font-size": size,
        "--background-color": props.backgroundColor,
      }}
    >
      {vnode}
    </span>
  );

  if (props.href) {
    return (
      <a
        class={styles.link}
        href={props.href}
        style={{ "--font-size": size }}
        target="_blank"
        rel="noopener noreferrer"
      >
        {props.favicon && <ElmInlineIcon src={props.favicon} />}
        {wrappedVnode}
      </a>
    );
  }

  return wrappedVnode;
});
