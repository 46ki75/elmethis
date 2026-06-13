import {
  defineComponent,
  onBeforeUnmount,
  onMounted,
  ref,
  type CSSProperties,
  type HTMLAttributes,
} from "vue";
import { clsx } from "clsx";

import styles from "./elm-page-top.module.css";

export interface ElmPageTopProps extends HTMLAttributes {
  /**
   * Specifies the position of the button.
   */
  position?: "left" | "right";
}

export const ElmPageTop = defineComponent({
  name: "ElmPageTop",
  props: {
    position: {
      type: String as () => "left" | "right",
      default: "right",
    },
  },
  setup(props) {
    const isVisible = ref(false);

    const checkScroll = () => {
      isVisible.value = window.scrollY > 100;
    };

    onMounted(() => {
      window.addEventListener("scroll", checkScroll, { passive: true });
      checkScroll(); // Check initial state
    });
    onBeforeUnmount(() => window.removeEventListener("scroll", checkScroll));

    const toTop = () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // inheritAttrs default: passthrough class/style merge onto the root nav.
    return () => (
      <nav
        class={clsx(styles["elm-page-top"], isVisible.value && styles.visible)}
        style={
          {
            "--elmethis-scoped-size": `${64}px`,
            left: props.position === "left" ? "0" : "auto",
            right: props.position === "right" ? "0" : "auto",
          } as CSSProperties
        }
        onClick={toTop}
      >
        <div aria-hidden="true" class={styles.partial}></div>
        <div aria-hidden="true" class={styles.partial}></div>
        <div aria-hidden="true" class={styles.partial}></div>
        <span class={styles.text}>Back to Top</span>
      </nav>
    );
  },
});
