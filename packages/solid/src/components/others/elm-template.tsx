import { type JSX } from "@solidjs/web";
import { omit } from "solid-js";
import { clsx } from "clsx";

import styles from "./elm-template.module.css";

export type ElmTemplateProps = JSX.HTMLAttributes<HTMLDivElement>;

export const ElmTemplate = (props: ElmTemplateProps) => {
  const rest = omit(props, "class", "children");

  return (
    <div {...rest} class={clsx(styles["elm-template"], props.class)}>
      {props.children}
    </div>
  );
};
