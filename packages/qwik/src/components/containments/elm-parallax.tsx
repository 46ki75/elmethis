import { component$, PropsOf, useSignal } from "@builder.io/qwik";

import styles from "./elm-parallax.module.css";

export interface ElmParallaxProps extends PropsOf<"div"> {
  images: string[];
}

export const ElmParallax = component$<ElmParallaxProps>(
  ({ class: className, images, ...props }) => {
    const y = useSignal(0);

    return (
      <div class={className} {...props}>
        <div
          class={styles["parallax-watcher"]}
          window:onScroll$={() => {
            y.value = window.scrollY;
          }}
        ></div>

        {images.map((image, index) => (
          <div
            key={index}
            class={styles.parallax}
            style={{
              backgroundImage: `url(${image})`,
              transform: `scale(1.2) translateY(${y.value / (1000 * (index + 1))}%)`,
              transformOrigin: "bottom",
            }}
          ></div>
        ))}
      </div>
    );
  },
);
