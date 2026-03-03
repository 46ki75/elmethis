import { component$, useSignal } from "@builder.io/qwik";

import styles from "./elm-parallax.module.scss";

export interface ElmParallaxProps {
  images: string[];
}

export const ElmParallax = component$<ElmParallaxProps>(({ images }) => {
  const y = useSignal(0);

  return (
    <>
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
    </>
  );
});
