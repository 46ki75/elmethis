import { component$, PropsOf } from "@builder.io/qwik";

import styles from "./elm-divider.module.css";

export type ElmDividerProps = PropsOf<"hr">;

export const ElmDivider = component$<PropsOf<"hr">>(
  ({ class: className, ...props }) => {
    return <hr class={[styles.hr, className]} {...props} />;
  },
);
