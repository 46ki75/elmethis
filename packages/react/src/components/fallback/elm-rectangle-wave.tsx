import type { ComponentPropsWithoutRef } from "react";
import { clsx } from "clsx";

import styles from "./elm-rectangle-wave.module.css";

export type ElmRectangleWaveProps = ComponentPropsWithoutRef<"div">;

export const ElmRectangleWave = ({
  className,
  ...props
}: ElmRectangleWaveProps) => {
  return (
    <div
      aria-hidden="true"
      className={clsx(styles["elm-rectangle-wave"], className)}
      {...props}
    ></div>
  );
};
