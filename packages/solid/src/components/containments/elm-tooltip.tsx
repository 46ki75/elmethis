import { createSignal, onCleanup, omit } from "solid-js";
import type { JSX } from "@solidjs/web";
import { clsx } from "clsx";

import { callEventHandler } from "../../primitives/call-event-handler";
import styles from "./elm-tooltip.module.css";

export interface ElmTooltipProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  /** The always-visible trigger content. */
  original?: JSX.Element;

  /** The content revealed on hover. */
  tooltip?: JSX.Element;
}

export const ElmTooltip = (props: ElmTooltipProps) => {
  const rest = omit(
    props,
    "class",
    "ref",
    "children",
    "original",
    "tooltip",
    "onMouseOver",
    "onMouseLeave",
  );
  const [isHover, setIsHover] = createSignal(false);
  const [position, setPosition] = createSignal<JSX.CSSProperties>({});
  let host: HTMLSpanElement | undefined;
  let hideTimer: ReturnType<typeof setTimeout> | undefined;

  const clearHideTimer = () => {
    if (hideTimer === undefined) {
      return;
    }
    clearTimeout(hideTimer);
    hideTimer = undefined;
  };

  onCleanup(clearHideTimer);

  const handleMouseOver: JSX.EventHandler<HTMLSpanElement, MouseEvent> = (
    event,
  ) => {
    clearHideTimer();

    if (host) {
      const rect = host.getBoundingClientRect();
      const viewportWidth = window.innerWidth;

      setPosition(
        rect.x > viewportWidth / 2
          ? {
              top: `${rect.bottom}px`,
              right: `${viewportWidth - rect.right}px`,
            }
          : { top: `${rect.bottom}px`, left: `${rect.x}px` },
      );
      setIsHover(true);
    }

    callEventHandler(props.onMouseOver, event);
  };

  const handleMouseLeave: JSX.EventHandler<HTMLSpanElement, MouseEvent> = (
    event,
  ) => {
    if (hideTimer === undefined) {
      hideTimer = setTimeout(() => {
        hideTimer = undefined;
        setIsHover(false);
      }, 250);
    }

    callEventHandler(props.onMouseLeave, event);
  };

  return (
    <span
      {...rest}
      ref={[
        (element) => {
          host = element;
        },
        props.ref,
      ]}
      class={clsx(styles["elm-tooltip"], props.class)}
      onMouseOver={handleMouseOver}
      onMouseLeave={handleMouseLeave}
    >
      {props.original}
      <div
        class={clsx(styles.tooltip, isHover() && styles.show)}
        style={position()}
      >
        {props.tooltip}
      </div>
    </span>
  );
};
