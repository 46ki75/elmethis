import { component$, PropsOf } from "@builder.io/qwik";

import styles from "./elm-rectangle-wave.module.css";

export type ElmRectangleWaveProps = PropsOf<"div">;

export const ElmRectangleWave = component$<PropsOf<"div">>(
  ({ class: className, ...props }) => {
    return (
      <div
        aria-hidden="true"
        class={[styles["rectangle-wave"], className]}
        {...props}
      ></div>
    );
  },
);
