import { component$ } from "@builder.io/qwik";
import { darken } from "polished";

import styles from "./elm-color-table.module.css";

export interface ElmColorTableProps {
  /**
   * The colors to display.
   */
  colors: { name: string; code: string }[];
}

const DARKNESS_VALUES = [
  -3, -0.25, -0.2, -0.15, -0.1, -0.05, 0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3,
];

export const ElmColorTable = component$<ElmColorTableProps>(({ colors }) => {
  return (
    <div class={styles.container}>
      {colors.map((color) => (
        <div key={color.name} class={styles["row-container"]}>
          <div
            class={styles["color-name"]}
            style={{ "--color": color.code } as Record<string, string>}
          >
            {color.name}
          </div>
          {DARKNESS_VALUES.map((darkness) => {
            const sampledColor = darken(Math.max(0, darkness), color.code);
            return (
              <div
                key={darkness}
                class={styles["color-sample"]}
                style={
                  { "--color-sample-bg": sampledColor } as Record<
                    string,
                    string
                  >
                }
              />
            );
          })}
        </div>
      ))}
    </div>
  );
});
