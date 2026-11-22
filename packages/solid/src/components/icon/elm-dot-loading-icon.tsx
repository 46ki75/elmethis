import { type JSX } from "@solidjs/web";
import { omit } from "solid-js";
import { clsx } from "clsx";

import styles from "./elm-dot-loading-icon.module.css";
import { mergeStyle } from "../../styles/merge-style";

export interface ElmDotLoadingIconProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  /** Specifies the size of the dot. */
  size?: JSX.CSSProperties["width"];
}

export const ElmDotLoadingIcon = (props: ElmDotLoadingIconProps) => {
  const rest = omit(props, "class", "style", "children", "size");

  return (
    <span
      class={clsx(styles["elm-dot-loading-icon"], props.class)}
      style={mergeStyle(props.style, {
        "--elmethis-scoped-size": props.size ?? "4em",
      })}
      {...rest}
    >
      <span class={styles.dot} aria-hidden="true" />
      <span class={styles.dot} aria-hidden="true" />
      <span class={styles.dot} aria-hidden="true" />
    </span>
  );
};
