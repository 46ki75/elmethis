import { type JSX } from "@solidjs/web";
import { omit } from "solid-js";
import { clsx } from "clsx";

import styles from "./elm-notion-callout.module.css";
import { ElmInlineIcon } from "../icon/elm-inline-icon";

export type NotionCalloutColor =
  | "default"
  | "gray"
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "cyan"
  | "blue"
  | "purple"
  | "magenta";

export type NotionCalloutVariant = "filled" | "outlined";

export type NotionCalloutIcon =
  | { kind: "emoji"; emoji: string }
  | { kind: "image"; src: string; alt?: string };

export interface ElmNotionCalloutProps extends JSX.HTMLAttributes<HTMLDivElement> {
  /** Icon shown before the content: a single emoji character or an image. */
  icon?: NotionCalloutIcon;

  /** Accent hue for the callout. */
  color?: NotionCalloutColor;

  /** Tinted background or transparent with a colored border. */
  variant?: NotionCalloutVariant;
}

export const ElmNotionCallout = (props: ElmNotionCalloutProps) => {
  const rest = omit(props, "class", "children", "icon", "color", "variant");

  return (
    <div
      {...rest}
      class={clsx(
        styles["elm-notion-callout"],
        styles[props.color ?? "gray"],
        styles[props.variant ?? "filled"],
        props.class,
      )}
    >
      {props.icon?.kind === "emoji" ? (
        <span class={styles.icon} role="img">
          {props.icon.emoji}
        </span>
      ) : props.icon?.kind === "image" ? (
        <ElmInlineIcon
          class={styles.icon}
          src={props.icon.src}
          alt={props.icon.alt}
          size={20}
        />
      ) : null}

      <div class={styles.content}>{props.children}</div>
    </div>
  );
};
