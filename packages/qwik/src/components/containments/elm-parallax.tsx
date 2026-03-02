import { component$, useSignal, useStylesScoped$ } from "@builder.io/qwik";

import styles from "./elm-parallax.scoped.scss?inline";

export interface ElmParallaxProps {
  imageUrl1?: string;
  imageUrl2?: string;
}

export const ElmParallax = component$<ElmParallaxProps>(
  ({ imageUrl1, imageUrl2 }) => {
    useStylesScoped$(styles);

    const y = useSignal(0);

    return (
      <>
        <div
          window:onScroll$={() => {
            y.value = window.scrollY;
          }}
          class="parallax"
          style={{
            backgroundImage: `url(${imageUrl1})`,
            transform: `scale(1.2) translateY(${y.value / 400}%)`,
            transformOrigin: "bottom",
          }}
        ></div>
        <div
          class="parallax"
          style={{
            backgroundImage: `url(${imageUrl2})`,
            transform: `scale(1.2) translateY(${y.value / 900}%)`,
            transformOrigin: "bottom",
          }}
        ></div>
      </>
    );
  },
);
