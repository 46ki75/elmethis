import { component$, Slot, type CSSProperties } from "@builder.io/qwik";

import styles from "./elm-collapse.module.css";

export interface ElmCollapseProps {
  class?: string;

  style?: CSSProperties;

  isOpen?: boolean;

  direction?: "row" | "column" | "both";
}

export const ElmCollapse = component$<ElmCollapseProps>(
  ({ class: className, style, isOpen, direction = "row" }) => {
    return (
      <div
        class={[
          styles["elm-collapse"],
          {
            [styles["open"]]: isOpen,
            [styles["row"]]: direction === "row",
            [styles["column"]]: direction === "column",
            [styles["both"]]: direction === "both",
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
