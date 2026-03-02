import { component$, useSignal, useStylesScoped$ } from "@builder.io/qwik";

import styles from "./elm-parallax.scoped.scss?inline";

export interface ElmParallaxProps {
  images: string[];
}

export const ElmParallax = component$<ElmParallaxProps>(({ images }) => {
  useStylesScoped$(styles);

  const y = useSignal(0);

  return (
    <>
      <div
        class="parallax-watcher"
        window:onScroll$={() => {
          y.value = window.scrollY;
        }}
      ></div>

      {images.map((image, index) => (
        <div
          key={index}
          class="parallax"
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
