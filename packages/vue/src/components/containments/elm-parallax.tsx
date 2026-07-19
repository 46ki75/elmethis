import {
  defineComponent,
  onBeforeUnmount,
  onMounted,
  ref,
  type HTMLAttributes,
  type PropType,
} from "vue";

import styles from "./elm-parallax.module.css";

const getTransform = (y: number, index: number) =>
  `scale(1.2) translateY(${y / (1000 * (index + 1))}%)`;

export interface ElmParallaxProps extends HTMLAttributes {
  images: string[];
}

export const ElmParallax = defineComponent({
  name: "ElmParallax",
  props: {
    images: { type: Array as PropType<string[]>, required: true },
  },
  setup(props) {
    const root = ref<HTMLDivElement>();
    let frame: number | undefined;
    let scrollY = 0;
    let appliedY = 0;
    let reducedMotion: MediaQueryList | undefined;

    const updateLayers = () => {
      frame = undefined;
      const y = reducedMotion?.matches ? 0 : scrollY;
      appliedY = y;

      root.value
        ?.querySelectorAll<HTMLElement>(`.${styles.parallax}`)
        .forEach((layer, index) => {
          layer.style.transform = getTransform(y, index);
        });
    };
    const scheduleUpdate = () => {
      scrollY = window.scrollY;
      frame ??= window.requestAnimationFrame(updateLayers);
    };

    onMounted(() => {
      reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
      window.addEventListener("scroll", scheduleUpdate, { passive: true });
      reducedMotion.addEventListener("change", scheduleUpdate);
      scheduleUpdate();
    });
    onBeforeUnmount(() => {
      window.removeEventListener("scroll", scheduleUpdate);
      reducedMotion?.removeEventListener("change", scheduleUpdate);
      if (frame !== undefined) window.cancelAnimationFrame(frame);
    });

    // inheritAttrs default: passthrough class/style merge onto the root.
    return () => (
      <div ref={root} class={styles["elm-parallax"]}>
        {props.images.map((image, index) => (
          <div
            key={index}
            aria-hidden="true"
            class={styles.parallax}
            style={{
              backgroundImage: `url(${JSON.stringify(image)})`,
              transform: getTransform(appliedY, index),
              transformOrigin: "bottom",
            }}
          ></div>
        ))}
      </div>
    );
  },
});
