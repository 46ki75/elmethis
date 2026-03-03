import { component$, CSSProperties } from "@builder.io/qwik";

import styles from "./elm-divider.module.scss";

export type ElmDividerProps = {
  /**
   * The margin of the divider.
   */
  margin?: CSSProperties["margin-block"];
};

export const ElmDivider = component$<ElmDividerProps>(({ margin }) => {
  return <hr class={styles.hr} style={{ marginBlock: margin }} />;
});
