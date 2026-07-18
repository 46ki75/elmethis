import {
  createSignal,
  For,
  onCleanup,
  onMount,
  splitProps,
  type JSX,
} from "solid-js";
import { clsx } from "clsx";

import styles from "./elm-parallax.module.css";

export interface ElmParallaxProps extends JSX.HTMLAttributes<HTMLDivElement> {
  images: string[];
}

export const ElmParallax = (props: ElmParallaxProps) => {
  const [local, rest] = splitProps(props, ["class", "images"]);
  const [scrollY, setScrollY] = createSignal(0);

  onMount(() => {
    const handleScroll = () => setScrollY(window.scrollY);

    window.addEventListener("scroll", handleScroll, { passive: true });
    onCleanup(() => window.removeEventListener("scroll", handleScroll));
  });

  return (
    <div class={clsx(styles["elm-parallax"], local.class)} {...rest}>
      <div class={styles["parallax-watcher"]} />
      <For each={local.images}>
        {(image, index) => (
          <div
            aria-hidden="true"
            class={styles.parallax}
            style={{
              "background-image": `url(${JSON.stringify(image)})`,
              transform: `scale(1.2) translateY(${scrollY() / (1000 * (index() + 1))}%)`,
              "transform-origin": "bottom",
            }}
          />
        )}
      </For>
    </div>
  );
};
