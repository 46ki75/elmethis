import { splitProps, type JSX } from "solid-js";
import { clsx } from "clsx";

import styles from "./elm-rectangle-wave.module.css";

export type ElmRectangleWaveProps = JSX.HTMLAttributes<HTMLDivElement>;

export const ElmRectangleWave = (props: ElmRectangleWaveProps) => {
  const [local, rest] = splitProps(props, ["class", "children"]);

  return (
    <div
      aria-hidden="true"
      class={clsx(styles["elm-rectangle-wave"], local.class)}
      {...rest}
    />
  );
};
