import { component$, CSSProperties } from "@builder.io/qwik";

import styles from "./elm-divider.module.scss";

export type ElmDividerProps = {
  style?: CSSProperties;
};

export const ElmDivider = component$<ElmDividerProps>(({ style }) => {
  return <hr class={styles.hr} style={style} />;
});
