import { type ComponentProps, type CSSProperties } from "react";

import textStyle from "../../styles/text.module.scss";
import style from "./ElmInlineText.module.scss";
import { clsx } from "clsx";
import { ElmInlineIcon } from "../icon/ElmInlineIcon";
import { getLuminance } from "polished";

export interface ElmInlineTextProps extends ComponentProps<"span"> {
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

export const ElmInlineText = (props: ElmInlineTextProps) => {
  const render = () => {
    const color =
      props.backgroundColor != null
        ? getLuminance(props.backgroundColor) < 0.5
          ? "rgba(255, 255, 255, 0.7)"
          : "rgba(0, 0, 0, 0.7)"
        : undefined;

    if (props.href) {
      return (
        <a
          className={style.link}
          href={props.href}
          target="blank"
          rel="noopener noreferrer"
        >
          {props.favicon && <ElmInlineIcon src={props.favicon} />}
          <span>{props.text || props.children}</span>
        </a>
      );
    } else if (props.kbd) {
      return (
        <kbd className={clsx([textStyle.text, style.kbd])}>
          {props.text || props.children}
        </kbd>
      );
    } else {
      const classes = [];

      if (props.underline) classes.push(style.underline);

      let component = (
        <span
          className={clsx([textStyle.text, style.base].concat(classes))}
          style={
            {
              "--color": props.color ?? color,
              "--font-size": props.size,
              "--background-color": props.backgroundColor,
            } as CSSProperties
          }
        >
          {props.text || props.children}
        </span>
      );

      if (props.bold) component = <strong>{component}</strong>;
      if (props.italic) component = <em>{component}</em>;
      if (props.strikethrough) component = <del>{component}</del>;
      if (props.code)
        component = <code className={style.code}>{component}</code>;

      if (props.ruby)
        component = (
          <ruby className={textStyle.text}>
            {component}
            <rt>{props.ruby}</rt>
          </ruby>
        );

      return component;
    }
  };

  return render();
};
