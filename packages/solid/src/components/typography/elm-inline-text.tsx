import {
  children,
  createMemo,
  mergeProps,
  splitProps,
  type JSX,
} from "solid-js";
import { clsx } from "clsx";

import styles from "./elm-inline-text.module.css";
import textStyles from "../../styles/text.module.css";

import { ElmInlineIcon } from "../icon/elm-inline-icon";

export interface ElmInlineTextProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  /** The text color. Defaults to the neutral text token. */
  color?: JSX.CSSProperties["color"];

  /** The font size and line height. */
  size?: JSX.CSSProperties["font-size"];

  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  kbd?: boolean;

  /** The text background color. */
  backgroundColor?: JSX.CSSProperties["background-color"];

  /** The ruby annotation displayed above the text. */
  ruby?: string;

  /** The external URL to wrap around the text. */
  href?: string;

  /** An optional favicon displayed inside the external link. */
  favicon?: string;
}

const mergeStyle = (
  style: ElmInlineTextProps["style"],
  scopedStyle: JSX.CSSProperties,
): JSX.CSSProperties | string => {
  if (typeof style !== "string") {
    return { ...(style ?? {}), ...scopedStyle };
  }

  const serializedScopedStyle = Object.entries(scopedStyle)
    .filter((entry) => entry[1] != null)
    .map(([name, value]) => `${name}:${String(value)}`)
    .join(";");

  return [style.trim().replace(/;$/, ""), serializedScopedStyle]
    .filter(Boolean)
    .join(";");
};

export const ElmInlineText = (props: ElmInlineTextProps) => {
  const merged = mergeProps({ size: "1em" }, props);
  const [local, rest] = splitProps(merged, [
    "class",
    "style",
    "children",
    "color",
    "size",
    "backgroundColor",
    "bold",
    "italic",
    "underline",
    "strikethrough",
    "code",
    "kbd",
    "ruby",
    "href",
    "favicon",
  ]);
  const resolvedChildren = children(() => local.children);

  const content = createMemo<JSX.Element>(() => {
    let node: JSX.Element = resolvedChildren();

    if (local.href) {
      node = (
        <a
          class={styles.link}
          href={local.href}
          target="_blank"
          rel="noopener noreferrer"
        >
          {local.favicon && <ElmInlineIcon src={local.favicon} alt="favicon" />}
          {node}
        </a>
      );
    }

    if (local.kbd) node = <kbd class={styles.kbd}>{node}</kbd>;
    if (local.strikethrough) node = <del>{node}</del>;
    if (local.italic) node = <em>{node}</em>;
    if (local.underline) node = <ins>{node}</ins>;
    if (local.bold) node = <strong>{node}</strong>;
    if (local.code) node = <code class={styles.code}>{node}</code>;

    if (local.ruby) {
      node = (
        <ruby class={styles["elm-inline-text"]}>
          <span>{node}</span>
          <rt>{local.ruby}</rt>
        </ruby>
      );
    }

    return node;
  });
  const rootStyle = createMemo(() =>
    mergeStyle(local.style, {
      "--elmethis-scoped-color": local.color,
      "--elmethis-scoped-font-size": local.size,
      "--elmethis-scoped-background-color": local.backgroundColor,
    }),
  );

  return (
    <span
      {...rest}
      class={clsx(styles["elm-inline-text"], textStyles.text, local.class)}
      style={rootStyle()}
    >
      {content()}
    </span>
  );
};
