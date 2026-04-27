import {
  $,
  component$,
  Slot,
  useSignal,
  type CSSProperties,
} from "@builder.io/qwik";

import styles from "./elm-tooltip.module.css";

export interface ElmTooltipProps {
  class?: string;

  style?: CSSProperties;
}

export const ElmTooltip = component$<ElmTooltipProps>(
  ({ class: className, style }) => {
    const elRef = useSignal<HTMLSpanElement>();
    const isHover = useSignal(false);
    const position = useSignal<CSSProperties>({});

    const handleMouseOver = $(() => {
      const el = elRef.value;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const windowWidth = window.innerWidth;

      if (rect.x > windowWidth / 2) {
        position.value = {
          top: `${rect.y}px`,
          right: `${windowWidth - rect.x - rect.width}px`,
        };
      } else {
        position.value = {
          top: `${rect.y}px`,
          left: `${rect.x}px`,
        };
      }

      isHover.value = true;
    });

    const handleMouseLeave = $(() => {
      isHover.value = false;
    });

    return (
      <span
        ref={elRef}
        class={[styles.original, className]}
        onMouseOver$={handleMouseOver}
        onMouseLeave$={handleMouseLeave}
        style={style}
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
