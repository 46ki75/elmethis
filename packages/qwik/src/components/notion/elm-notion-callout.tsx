import { component$, PropsOf, Slot } from "@qwik.dev/core";

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

export interface ElmNotionCalloutProps extends PropsOf<"div"> {
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

export const ElmNotionCallout = component$<ElmNotionCalloutProps>(
  ({
    class: className,
    style,
    icon,
    color = "gray",
    variant = "filled",
    ...props
  }) => {
    return (
      <div
        class={[
          styles["elm-notion-callout"],
          styles[color],
          styles[variant],
          className,
        ]}
        style={style}
        {...props}
      >
        {icon !== undefined &&
          (icon.kind === "emoji" ? (
            <span class={styles.icon} role="img">
              {icon.emoji}
            </span>
          ) : (
            <ElmInlineIcon
              class={styles.icon}
              src={icon.src}
              alt={icon.alt}
              size={20}
            />
          ))}

        <div class={styles.content}>
          <Slot />
        </div>
      </div>
    );
  },
);
