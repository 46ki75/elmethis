import type { ComponentPropsWithoutRef } from "react";
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

export interface ElmNotionCalloutProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Icon shown before the content: a single emoji character or an image.
   */
  icon?: NotionCalloutIcon;

  /**
   * Accent hue for the callout.
   */
  color?: NotionCalloutColor;

  /**
   * Tinted background ("filled") or transparent with a colored border
   * ("outlined").
   */
  variant?: NotionCalloutVariant;
}

export const ElmNotionCallout = ({
  className,
  style,
  icon,
  color = "gray",
  variant = "filled",
  children,
  ...props
}: ElmNotionCalloutProps) => {
  return (
    <div
      className={clsx(
        styles["elm-notion-callout"],
        styles[color],
        styles[variant],
        className,
      )}
      style={style}
      {...props}
    >
      {icon !== undefined &&
        (icon.kind === "emoji" ? (
          <span className={styles.icon} role="img">
            {icon.emoji}
          </span>
        ) : (
          <ElmInlineIcon
            className={styles.icon}
            src={icon.src}
            alt={icon.alt}
            size={20}
          />
        ))}

      <div className={styles.content}>{children}</div>
    </div>
  );
};
