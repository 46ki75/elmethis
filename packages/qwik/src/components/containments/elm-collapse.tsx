import { component$, PropsOf, Slot } from "@builder.io/qwik";

import styles from "./elm-collapse.module.css";

export interface ElmCollapseProps extends PropsOf<"div"> {
  isOpen?: boolean;

  direction?: "row" | "column" | "both";
}

export const ElmCollapse = component$<ElmCollapseProps>(
  ({ class: className, isOpen, direction = "row", ...props }) => {
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
        {...props}
      >
        <div class={styles["inner"]}>
          <Slot />
        </div>
      </div>
    );
  },
);
