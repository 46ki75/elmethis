import { component$, Slot, type CSSProperties } from "@builder.io/qwik";

import styles from "./elm-collapse.module.css";

export interface ElmCollapseProps {
  class?: string;

  style?: CSSProperties;

  isOpen?: boolean;

  direction?: "row" | "column";
}

export const ElmCollapse = component$<ElmCollapseProps>(
  ({ class: className, style, isOpen, direction = "row" }) => {
    return (
      <div
        class={[
          styles["elm-collapse"],
          {
            [styles["open"]]: isOpen,
            [styles[direction]]: true,
          },
          className,
        ]}
        style={style}
      >
        <div class={styles["inner"]}>
          <Slot />
        </div>
      </div>
    );
  },
);
