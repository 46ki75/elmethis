import { createSignal, For, omit, onSettled } from "solid-js";
import type { JSX } from "@solidjs/web";
import { clsx } from "clsx";

import styles from "./elm-parallax.module.css";

const getTransform = (y: number, index: number) =>
  `scale(1.2) translateY(${y / (1000 * (index + 1))}%)`;

export interface ElmParallaxProps extends JSX.HTMLAttributes<HTMLDivElement> {
  images: string[];
}

export const ElmParallax = (props: ElmParallaxProps) => {
  const rest = omit(props, "class", "images");
  const [offset, setOffset] = createSignal(0);

  onSettled(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame: number | undefined;
    let scrollY = window.scrollY;

    const updateLayers = () => {
      frame = undefined;
      setOffset(reducedMotion.matches ? 0 : scrollY);
    };
    const scheduleUpdate = () => {
      scrollY = window.scrollY;
      frame ??= window.requestAnimationFrame(updateLayers);
    };

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    reducedMotion.addEventListener("change", scheduleUpdate);
    scheduleUpdate();

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      reducedMotion.removeEventListener("change", scheduleUpdate);
      if (frame !== undefined) {
        window.cancelAnimationFrame(frame);
      }
    };
  });

  return (
    <div class={clsx(styles["elm-parallax"], props.class)} {...rest}>
      <For each={props.images}>
        {(image, index) => (
          <div
            aria-hidden="true"
            class={styles.parallax}
            style={{
              "background-image": `url(${JSON.stringify(image)})`,
              transform: getTransform(offset(), index()),
              "transform-origin": "bottom",
            }}
          />
        )}
      </For>
    </div>
  );
};
