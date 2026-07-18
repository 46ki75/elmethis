import { createSignal, onCleanup, splitProps, type JSX } from "solid-js";
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
  const [local, rest] = splitProps(props, [
    "class",
    "ref",
    "children",
    "original",
    "tooltip",
    "onMouseOver",
    "onMouseLeave",
  ]);
  const [isHover, setIsHover] = createSignal(false);
  const [position, setPosition] = createSignal<JSX.CSSProperties>({});
  let host: HTMLSpanElement | undefined;
  let hideTimer: ReturnType<typeof setTimeout> | undefined;

  const clearHideTimer = () => {
    if (hideTimer === undefined) return;
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

    callEventHandler(local.onMouseOver, event);
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

    callEventHandler(local.onMouseLeave, event);
  };

  return (
    <span
      {...rest}
      ref={(element) => {
        host = element;
        if (typeof local.ref === "function") local.ref(element);
      }}
      class={clsx(styles["elm-tooltip"], local.class)}
      onMouseOver={handleMouseOver}
      onMouseLeave={handleMouseLeave}
    >
      {local.original}
      <div
        class={clsx(styles.tooltip, isHover() && styles.show)}
        style={position()}
      >
        {local.tooltip}
      </div>
    </span>
  );
};
