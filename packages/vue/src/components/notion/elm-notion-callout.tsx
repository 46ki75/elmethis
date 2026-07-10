import { defineComponent, type PropType, type HTMLAttributes } from "vue";
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

export interface ElmNotionCalloutProps extends HTMLAttributes {
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

export const ElmNotionCallout = defineComponent({
  name: "ElmNotionCallout",
  inheritAttrs: false,
  props: {
    icon: { type: Object as PropType<NotionCalloutIcon>, default: undefined },
    color: {
      type: String as PropType<NotionCalloutColor>,
      default: "gray",
    },
    variant: {
      type: String as PropType<NotionCalloutVariant>,
      default: "filled",
    },
  },
  setup(props, { slots, attrs }) {
    return () => {
      const { class: className, ...rest } = attrs as Record<string, unknown>;
      return (
        <div
          class={clsx(
            styles["elm-notion-callout"],
            styles[props.color],
            styles[props.variant],
            className as string | undefined,
          )}
          {...rest}
        >
          {props.icon !== undefined &&
            (props.icon.kind === "emoji" ? (
              <span class={styles.icon} role="img">
                {props.icon.emoji}
              </span>
            ) : (
              <ElmInlineIcon
                class={styles.icon}
                src={props.icon.src}
                alt={props.icon.alt}
                size={20}
              />
            ))}

          <div class={styles.content}>{slots.default?.()}</div>
        </div>
      );
    };
  },
});
