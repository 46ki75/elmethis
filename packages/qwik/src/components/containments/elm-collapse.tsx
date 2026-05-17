import { component$, CSSProperties, PropsOf, Slot } from "@qwik.dev/core";

import styles from "./elm-collapse.module.css";

export interface ElmCollapseProps extends PropsOf<"div"> {
  isOpen?: boolean;

  direction?: "row" | "column" | "both";

  transitionTimingFunction?: CSSProperties["transition-timing-function"];
}

export const ElmCollapse = component$<ElmCollapseProps>(
  ({
    class: className,
    isOpen,
    direction = "row",
    transitionTimingFunction = "ease-in-out",
    ...props
  }) => {
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
        style={{
          "--elmethis-scoped-transition-timing-function":
            transitionTimingFunction,
        }}
        {...props}
      >
        <div class={styles["inner"]}>
          <Slot />
        </div>
      </div>
    );
  },
);
