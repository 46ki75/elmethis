import { type JSX } from "@solidjs/web";
import { omit } from "solid-js";
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
  const rest = omit(
    props,
    "class",
    "children",
    "src",
    "alt",
    "width",
    "height",
    "size",
  );

  return (
    <span {...rest} class={clsx(styles["elm-inline-icon"], props.class)}>
      <img
        src={props.src}
        alt={props.alt}
        class={styles["elm-inline-icon"]}
        width={props.width ?? props.size ?? 16}
        height={props.height ?? props.size ?? 16}
      />
    </span>
  );
};
