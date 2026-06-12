import { component$, PropsOf } from "@qwik.dev/core";

import styles from "./elm-divider.module.css";

export type ElmDividerProps = PropsOf<"hr">;

export const ElmDivider = component$<PropsOf<"hr">>(
  ({ class: className, ...props }) => {
    return <hr class={[styles["elm-divider"], className]} {...props} />;
  },
);
