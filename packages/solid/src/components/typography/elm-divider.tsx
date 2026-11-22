import { type JSX } from "@solidjs/web";
import { omit } from "solid-js";
import { clsx } from "clsx";

import styles from "./elm-divider.module.css";

export type ElmDividerProps = JSX.HTMLAttributes<HTMLHRElement>;

export const ElmDivider = (props: ElmDividerProps) => {
  const rest = omit(props, "class");

  return <hr class={clsx(styles["elm-divider"], props.class)} {...rest} />;
};
