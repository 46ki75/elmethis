import { type JSX } from "@solidjs/web";
import { omit } from "solid-js";
import { clsx } from "clsx";

import styles from "./elm-rectangle-wave.module.css";

export type ElmRectangleWaveProps = JSX.HTMLAttributes<HTMLDivElement>;

export const ElmRectangleWave = (props: ElmRectangleWaveProps) => {
  const rest = omit(props, "class", "children");

  return (
    <div
      aria-hidden="true"
      class={clsx(styles["elm-rectangle-wave"], props.class)}
      {...rest}
    />
  );
};
