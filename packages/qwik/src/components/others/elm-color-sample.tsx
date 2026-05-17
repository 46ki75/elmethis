import { $, component$, PropsOf, useSignal } from "@qwik.dev/core";
import { parseToHsl, parseToRgb, rgbToColorString } from "polished";
import { mdiCheck } from "@mdi/js";

import { ElmTooltip } from "../containments/elm-tooltip";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";

import styles from "./elm-color-sample.module.css";

export interface ElmColorSampleProps extends PropsOf<"div"> {
  /**
   * The color to display.
   */
  color: string;
}

export const ElmColorSample = component$<ElmColorSampleProps>(({ color, class: className, ...props }) => {
  const { red, green, blue } = parseToRgb(color);
  const { hue, saturation, lightness } = parseToHsl(color);

  const hex = rgbToColorString({ red, green, blue });
  const rgb = `rgb(${red}, ${green}, ${blue})`;
  const hsl = `hsl(${Math.floor(hue)}, ${Math.floor(saturation * 100)}%, ${Math.floor(lightness * 100)}%)`;

  const copied = useSignal(false);

  const copyText = $(async (text: string) => {
    await window.navigator.clipboard.writeText(text);
    copied.value = true;
    window.setTimeout(() => {
      copied.value = false;
    }, 1500);
  });

  return (
    <div
      class={className}
      style={{ "--color": color } as Record<string, string>}
      {...props}
    >
      <ElmTooltip>
        <div q:slot="original">
          <div
            class={styles["color-bg"]}
            style={{ "--background-color": color } as Record<string, string>}
            onClick$={() => copyText(hex)}
          >
            {copied.value && (
              <ElmMdiIcon d={mdiCheck} size="1em" color="white" />
            )}
          </div>
          <div class={styles.text} onClick$={() => copyText(hex)}>
            {hex}
          </div>
        </div>
        <div q:slot="tooltip">
          <div class={styles.text} onClick$={() => copyText(hex)}>
            {hex}
          </div>
          <div class={styles.text} onClick$={() => copyText(rgb)}>
            {rgb}
          </div>
          <div class={styles.text} onClick$={() => copyText(hsl)}>
            {hsl}
          </div>
        </div>
      </ElmTooltip>
    </div>
  );
});
