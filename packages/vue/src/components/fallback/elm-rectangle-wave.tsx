import { defineComponent, type HTMLAttributes } from "vue";
import { clsx } from "clsx";

import styles from "./elm-rectangle-wave.module.css";

export type ElmRectangleWaveProps = HTMLAttributes;

export const ElmRectangleWave = defineComponent({
  name: "ElmRectangleWave",
  setup() {
    // inheritAttrs default: passthrough class/style merge onto the root.
    return () => (
      <div aria-hidden="true" class={clsx(styles["elm-rectangle-wave"])}></div>
    );
  },
});
