import { $, component$, PropsOf, Slot, useSignal, type CSSProperties } from "@qwik.dev/core";

import styles from "./elm-tooltip.module.css";

export type ElmTooltipProps = PropsOf<"span">;

export const ElmTooltip = component$<PropsOf<"span">>(
  ({ class: className, ...props }) => {
    const elRef = useSignal<HTMLSpanElement>();
    const isHover = useSignal(false);
    const isHideSchedule = useSignal(false);
    const hideTimerId = useSignal<number>();
    const position = useSignal<CSSProperties>({});

    const handleMouseOver = $(() => {
      const el = elRef.value;
      if (!el) return;

      if (isHideSchedule.value) {
        window.clearTimeout(hideTimerId.value);
        isHideSchedule.value = false;
      }

      const rect = el.getBoundingClientRect();
      const windowWidth = window.innerWidth;

      if (rect.x > windowWidth / 2) {
        position.value = {
          top: `${rect.bottom}px`,
          right: `${windowWidth - rect.x - rect.width}px`,
        };
      } else {
        position.value = {
          top: `${rect.bottom}px`,
          left: `${rect.x}px`,
        };
      }

      isHover.value = true;
    });

    const handleMouseLeave = $(() => {
      if (isHideSchedule.value) return;
      isHideSchedule.value = true;

      hideTimerId.value = window.setTimeout(() => {
        isHideSchedule.value = false;
        isHover.value = false;
      }, 250);
    });

    return (
      <span
        ref={elRef}
        class={[styles.original, className]}
        onMouseOver$={handleMouseOver}
        onMouseLeave$={handleMouseLeave}
        {...props}
      >
        <Slot name="original" />

        <div
          class={[
            styles.tooltip,
            {
              [styles.show]: isHover.value,
            },
          ]}
          style={position.value}
        >
          <Slot name="tooltip" />
        </div>
      </span>
    );
  },
);
