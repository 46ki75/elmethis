import { component$, Slot, type CSSProperties } from "@builder.io/qwik";

import styles from "./elm-collapse.module.css";

export interface ElmCollapseProps {
  class?: string;

  style?: CSSProperties;

  isOpen?: boolean;
}

export const ElmCollapse = component$<ElmCollapseProps>(({ class: className, style, isOpen }) => {
  return (
    <div
      class={[
        styles["elm-collapse"],
        {
          [styles["open"]]: isOpen,
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
});
