import { component$, useSignal, useVisibleTask$, $ } from "@builder.io/qwik";

import styles from "./elm-page-top.module.scss";

export interface ElmPageTopProps {
  /**
   * Specifies the position of the button.
   */
  position?: "left" | "right";
}

export const ElmPageTop = component$<ElmPageTopProps>(
  ({ position = "right" }) => {
    const isVisible = useSignal(false);

    // Initial check and scroll listener
    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(
      ({ cleanup }) => {
        const checkScroll = () => {
          isVisible.value = window.scrollY > 100;
        };

        window.addEventListener("scroll", checkScroll, { passive: true });
        checkScroll(); // Check initial state

        cleanup(() => window.removeEventListener("scroll", checkScroll));
      },
      { strategy: "document-idle" },
    );

    const toTop = $(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    return (
      <nav
        class={[
          styles.wrapper,
          { [styles["wrapper--visible"]]: isVisible.value },
        ]}
        style={{
          "--size": `${64}px`,
          left: position === "left" ? "0" : "auto",
          right: position === "right" ? "0" : "auto",
        }}
        onClick$={toTop}
      >
        <div aria-hidden="true" class={styles.partial}></div>
        <div aria-hidden="true" class={styles.partial}></div>
        <div aria-hidden="true" class={styles.partial}></div>
        <span class={styles.text}>Back to Top</span>
      </nav>
    );
  },
);
