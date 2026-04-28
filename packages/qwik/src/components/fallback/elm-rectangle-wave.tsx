import { component$, type CSSProperties } from "@builder.io/qwik";

import styles from "./elm-rectangle-wave.module.scss";

export interface ElmRectangleWaveProps {
  class?: string;

  style?: CSSProperties;

  placeholder?: string;
}

export const ElmRectangleWave = component$<ElmRectangleWaveProps>(
  ({ class: className, style }) => {
    return (
      <div
        aria-hidden="true"
        class={[styles["rectangle-wave"], className]}
        style={style}
      ></div>
    );
  },
);
