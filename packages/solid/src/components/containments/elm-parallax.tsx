import { For, onCleanup, onMount, splitProps, type JSX } from "solid-js";
import { clsx } from "clsx";

import styles from "./elm-parallax.module.css";

const getTransform = (y: number, index: number) =>
  `scale(1.2) translateY(${y / (1000 * (index + 1))}%)`;

export interface ElmParallaxProps extends JSX.HTMLAttributes<HTMLDivElement> {
  images: string[];
}

export const ElmParallax = (props: ElmParallaxProps) => {
  const [local, rest] = splitProps(props, ["class", "images"]);
  let root: HTMLDivElement | undefined;
  let appliedY = 0;

  onMount(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame: number | undefined;
    let scrollY = window.scrollY;

    const updateLayers = () => {
      frame = undefined;
      const y = reducedMotion.matches ? 0 : scrollY;
      appliedY = y;

      root
        ?.querySelectorAll<HTMLElement>(`.${styles.parallax}`)
        .forEach((layer, index) => {
          layer.style.transform = getTransform(y, index);
        });
    };
    const scheduleUpdate = () => {
      scrollY = window.scrollY;
      frame ??= window.requestAnimationFrame(updateLayers);
    };

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    reducedMotion.addEventListener("change", scheduleUpdate);
    scheduleUpdate();

    onCleanup(() => {
      window.removeEventListener("scroll", scheduleUpdate);
      reducedMotion.removeEventListener("change", scheduleUpdate);
      if (frame !== undefined) window.cancelAnimationFrame(frame);
    });
  });

  return (
    <div
      ref={(element) => {
        root = element;
      }}
      class={clsx(styles["elm-parallax"], local.class)}
      {...rest}
    >
      <For each={local.images}>
        {(image, index) => (
          <div
            aria-hidden="true"
            class={styles.parallax}
            style={{
              "background-image": `url(${JSON.stringify(image)})`,
              transform: getTransform(appliedY, index()),
              "transform-origin": "bottom",
            }}
          />
        )}
      </For>
    </div>
  );
};
