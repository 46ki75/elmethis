import { mergeProps, splitProps, type JSX } from "solid-js";
import { clsx } from "clsx";

import styles from "./elm-dot-loading-icon.module.css";
import { mergeStyle } from "../../styles/merge-style";

export interface ElmDotLoadingIconProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  /** Specifies the size of the dot. */
  size?: JSX.CSSProperties["width"];
}

export const ElmDotLoadingIcon = (props: ElmDotLoadingIconProps) => {
  const merged = mergeProps({ size: "4em" }, props);
  const [local, rest] = splitProps(merged, [
    "class",
    "style",
    "children",
    "size",
  ]);

  return (
    <span
      class={clsx(styles["elm-dot-loading-icon"], local.class)}
      style={mergeStyle(local.style, { "--elmethis-scoped-size": local.size })}
      {...rest}
    >
      <span class={styles.dot} aria-hidden="true" />
      <span class={styles.dot} aria-hidden="true" />
      <span class={styles.dot} aria-hidden="true" />
    </span>
  );
};
