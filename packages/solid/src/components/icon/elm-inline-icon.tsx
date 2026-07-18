import { mergeProps, splitProps, type JSX } from "solid-js";
import { clsx } from "clsx";

import styles from "./elm-inline-icon.module.css";

export interface ElmInlineIconProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  /** The source URL of the icon. */
  src: string;

  /** The alt text for the icon. */
  alt?: string;

  width?: number | `${number}`;
  height?: number | `${number}`;
  size?: number | `${number}`;
}

export const ElmInlineIcon = (props: ElmInlineIconProps) => {
  const merged = mergeProps({ size: 16 }, props);
  const [local, rest] = splitProps(merged, [
    "class",
    "children",
    "src",
    "alt",
    "width",
    "height",
    "size",
  ]);

  return (
    <span {...rest} class={clsx(styles["elm-inline-icon"], local.class)}>
      <img
        src={local.src}
        alt={local.alt}
        class={styles["elm-inline-icon"]}
        width={local.width ?? local.size}
        height={local.height ?? local.size}
      />
    </span>
  );
};
