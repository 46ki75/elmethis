import { component$ } from "@builder.io/qwik";

import styles from "./elm-rectangle-wave.module.scss";

export interface ElmRectangleWaveProps {
  placeholder?: string;
}

export const ElmRectangleWave = component$<ElmRectangleWaveProps>(() => {
  return <div aria-hidden="true" class={styles["rectangle-wave"]}></div>;
});
