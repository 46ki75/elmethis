import { component$, Slot } from "@builder.io/qwik";

import styles from "./elm-collapse.module.css";

export interface ElmCollapseProps {
  isOpen?: boolean;
}

export const ElmCollapse = component$<ElmCollapseProps>(({ isOpen }) => {
  return (
    <div
      class={[
        styles["elm-collapse"],
        {
          [styles["open"]]: isOpen,
        },
      ]}
    >
      <div class={styles["inner"]}>
        <Slot />
      </div>
    </div>
  );
});
