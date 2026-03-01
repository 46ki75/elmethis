import { component$, CSSProperties, useStylesScoped$ } from "@builder.io/qwik";

import styles from "./elm-divider.scoped.scss?inline";

export type ElmDividerProps = {
  /**
   * The margin of the divider.
   */
  margin?: CSSProperties["margin-block"];
};

export const ElmDivider = component$<ElmDividerProps>(({ margin }) => {
  useStylesScoped$(styles);
  return <hr class="hr" style={{ marginBlock: margin }} />;
});
