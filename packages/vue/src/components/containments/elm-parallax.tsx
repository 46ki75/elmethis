import {
  defineComponent,
  onBeforeUnmount,
  onMounted,
  ref,
  type CSSProperties,
  type HTMLAttributes,
  type PropType,
} from "vue";

import styles from "./elm-parallax.module.css";

export interface ElmParallaxProps extends HTMLAttributes {
  images: string[];
}

export const ElmParallax = defineComponent({
  name: "ElmParallax",
  props: {
    images: { type: Array as PropType<string[]>, required: true },
  },
  setup(props) {
    const y = ref(0);

    const handleScroll = () => {
      y.value = window.scrollY;
    };

    onMounted(() => window.addEventListener("scroll", handleScroll));
    onBeforeUnmount(() => window.removeEventListener("scroll", handleScroll));

    // inheritAttrs default: passthrough class/style merge onto the root.
    return () => (
      <div>
        <div class={styles["parallax-watcher"]}></div>

        {props.images.map((image, index) => (
          <div
            key={index}
            class={styles.parallax}
            style={
              {
                backgroundImage: `url(${image})`,
                transform: `scale(1.2) translateY(${y.value / (1000 * (index + 1))}%)`,
                transformOrigin: "bottom",
              } as CSSProperties
            }
          ></div>
        ))}
      </div>
    );
  },
});
