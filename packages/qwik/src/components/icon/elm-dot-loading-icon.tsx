import {
  component$,
  type CSSProperties,
  useStylesScoped$,
} from "@builder.io/qwik";

import styles from "./elm-dot-loading-icon.scoped.scss?inline";

export interface ElmDotLoadingIconProps {
  /**
   * Specifies the color of the dot.
   *
   * e.g.) `'red'`, `'#ff0000'`, `'rgba(255, 0, 0, 0.5)'`
   */
  color?: CSSProperties["backgroundColor"];

  /**
   * Specifies the size of the dot.
   */
  size?: CSSProperties["width"];
}

export const ElmDotLoadingIcon = component$<ElmDotLoadingIconProps>(
  ({ size = "4em", color = "#606875" }) => {
    useStylesScoped$(styles);
    return (
      <div
        class="wrapper"
        style={{
          "--size": size,
          "--color": color,
        }}
      >
        <div class="dot" aria-hidden="true"></div>
        <div class="dot" aria-hidden="true"></div>
        <div class="dot" aria-hidden="true"></div>
      </div>
    );
  },
);
