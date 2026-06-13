import {
  defineComponent,
  ref,
  type CSSProperties,
  type HTMLAttributes,
} from "vue";
import { clsx } from "clsx";

import styles from "./elm-tooltip.module.css";

export type ElmTooltipProps = HTMLAttributes;

export const ElmTooltip = defineComponent({
  name: "ElmTooltip",
  setup(_, { slots }) {
    const elRef = ref<HTMLSpanElement | null>(null);
    const isHover = ref(false);
    let isHideSchedule = false;
    let hideTimerId: ReturnType<typeof setTimeout> | undefined;
    const position = ref<CSSProperties>({});

    const handleMouseOver = () => {
      const el = elRef.value;
      if (!el) return;

      if (isHideSchedule) {
        window.clearTimeout(hideTimerId);
        isHideSchedule = false;
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
    };

    const handleMouseLeave = () => {
      if (isHideSchedule) return;
      isHideSchedule = true;

      hideTimerId = setTimeout(() => {
        isHideSchedule = false;
        isHover.value = false;
      }, 250);
    };

    // inheritAttrs default: a passthrough class merges with the root binding and
    // a passthrough onMouseover/onMouseleave is invoked alongside ours.
    return () => (
      <span
        ref={elRef}
        class={clsx(styles["elm-tooltip"])}
        onMouseover={handleMouseOver}
        onMouseleave={handleMouseLeave}
      >
        {slots.original?.()}

        <div
          class={clsx(styles.tooltip, isHover.value && styles.show)}
          style={position.value as CSSProperties}
        >
          {slots.tooltip?.()}
        </div>
      </span>
    );
  },
});
