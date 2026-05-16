import { component$, PropsOf } from "@qwik.dev/core";
import { darken } from "polished";

import { ElmColorSample } from "./elm-color-sample";

import styles from "./elm-color-table.module.css";

export interface ElmColorTableProps extends PropsOf<"div"> {
  /**
   * The colors to display.
   */
  colors: { name: string; code: string }[];
}

// Darkness amounts passed to polished's darken(). Negative values lighten the
// color (polished clamps HSL lightness to [0, 1]). -3 intentionally produces
// the fully-lightened (near-white) shade at the start of each row.
const DARKNESS_VALUES = [
  -3, -0.25, -0.2, -0.15, -0.1, -0.05, 0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3,
];

export const ElmColorTable = component$<ElmColorTableProps>(({ colors, class: className, ...props }) => {
  return (
    <div class={[styles.container, className]} {...props}>
      {colors.map((color) => (
        <div key={color.name} class={styles["row-container"]}>
          <div
            class={styles["color-name"]}
            style={{ "--color": color.code } as Record<string, string>}
          >
            {color.name}
          </div>
          {DARKNESS_VALUES.map((darkness) => (
            <ElmColorSample
              key={darkness}
              color={darken(darkness, color.code)}
            />
          ))}
        </div>
      ))}
    </div>
  );
});
