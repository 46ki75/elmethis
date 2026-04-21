import { component$, useSignal, type CSSProperties } from "@builder.io/qwik";

import styles from "./elm-parallax.module.scss";

export interface ElmParallaxProps {
  class?: string;

  style?: CSSProperties;

  images: string[];
}

export const ElmParallax = component$<ElmParallaxProps>(({ class: className, style, images }) => {
  const y = useSignal(0);

  return (
    <div class={className} style={style}>
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
});
