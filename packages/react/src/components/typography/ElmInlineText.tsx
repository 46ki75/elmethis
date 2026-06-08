import React from "react";
import { getLuminance } from "polished";

// Styles
import "@styles/global.css";
import styles from "./ElmInlineText.module.css";

// Components
import { ElmInlineIcon } from "@components/icon/ElmInlineIcon";
import type { ElmethisCSSVariables } from "@styles/variables";

export type ElmInlineTextCSSVariables = Pick<
  ElmethisCSSVariables,
  "--elmethis-color-neutral"
> & {
  "--elmethis-scoped-color"?: React.CSSProperties["color"];
};

interface InlineLinkProps {
  href?: string;
  favicon?: string;
}

export type ElmInlineTextProps = {
  style?: React.CSSProperties & ElmInlineTextCSSVariables;

  className?: string;

  color?: React.CSSProperties["color"];

  backgroundColor?: React.CSSProperties["backgroundColor"];

  size?: React.CSSProperties["fontSize"];

  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  kbd?: boolean;
  ruby?: string;
} & InlineLinkProps &
  React.PropsWithChildren;

export const ElmInlineText = (props: ElmInlineTextProps) => {
  const renderInlineText = (props: ElmInlineTextProps) => {
    let component = props.children;

    if (props.kbd) component = <kbd>{component}</kbd>;
    if (props.code) component = <code>{component}</code>;
    if (props.strikethrough) component = <del>{component}</del>;
    if (props.underline) component = <ins>{component}</ins>;
    if (props.italic) component = <em>{component}</em>;
    if (props.bold) component = <strong>{component}</strong>;

    if (props.ruby) {
      component = (
        <ruby>
          {component}
          <rt>{props.ruby}</rt>
        </ruby>
      );
    }

    return component;
  };

  const renderInlineLink = ({
    favicon,
    href,
    children,
  }: InlineLinkProps & React.PropsWithChildren) => {
    return (
      <a
        className={styles.link}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
      >
        {favicon && <ElmInlineIcon src={favicon} />}
        {children}
      </a>
    );
  };

  const render = (props: ElmInlineTextProps) => {
    return props.href ? renderInlineLink(props) : renderInlineText(props);
  };

  return (
    <span
      className={[styles.text, props.className].filter(Boolean).join(" ")}
      style={{
        "--elmethis-scoped-color": props.color,
        color:
          props.color ??
          (props.backgroundColor
            ? getLuminance(props.backgroundColor) > 0.5
              ? "#3e434b"
              : "#eeeff1"
            : undefined),
        backgroundColor: props.backgroundColor,
        ...props.style,
      }}
    >
      {render(props)}
    </span>
  );
};
