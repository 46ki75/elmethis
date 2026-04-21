import { component$, CSSProperties } from "@builder.io/qwik";

import styles from "./elm-divider.module.scss";

export type ElmDividerProps = {
  class?: string;

  style?: CSSProperties;
};

export const ElmDivider = component$<ElmDividerProps>(({ class: className, style }) => {
  return <hr class={[styles.hr, className]} style={style} />;
});
