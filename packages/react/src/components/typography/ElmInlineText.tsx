import { type ComponentProps, type CSSProperties } from "react";

import textStyle from "../../styles/text.module.scss";
import style from "./ElmInlineText.module.scss";
import { clsx } from "clsx";

export interface ElmTextProps extends ComponentProps<"span"> {
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

const ElmInlineText = (props: ElmTextProps) => {
  const render = () => {
    if (props.href) {
      return (
        <a
          className={style.link}
          href={props.href}
          target="blank"
          rel="noopener noreferrer"
        >
          {props.text || props.children}
        </a>
      );
    } else {
      const classes = [];

      if (props.underline) classes.push(style.underline);

      let component = (
        <span
          className={clsx([textStyle.text].concat(classes))}
          style={{ "--color": props.color } as CSSProperties}
        >
          {props.text || props.children}
        </span>
      );

      if (props.bold) component = <strong>{component}</strong>;
      if (props.italic) component = <em>{component}</em>;
      if (props.strikethrough) component = <del>{component}</del>;
      if (props.code) component = <code>{component}</code>;

      return component;
    }
  };

  return render();
};

export default ElmInlineText;
