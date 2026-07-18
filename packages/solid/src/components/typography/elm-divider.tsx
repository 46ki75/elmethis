import { splitProps, type JSX } from "solid-js";
import { clsx } from "clsx";

import styles from "./elm-divider.module.css";

export type ElmDividerProps = JSX.HTMLAttributes<HTMLHRElement>;

export const ElmDivider = (props: ElmDividerProps) => {
  const [local, rest] = splitProps(props, ["class"]);

  return <hr class={clsx(styles["elm-divider"], local.class)} {...rest} />;
};
