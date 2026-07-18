import { For, splitProps, type JSX } from "solid-js";
import { clsx } from "clsx";

import styles from "./elm-color-primitive-sample.module.css";
import { createColorSampleCopy } from "./color-sample-copy";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";

export type ElmColorPrimitiveSampleProps = JSX.HTMLAttributes<HTMLDivElement>;

const FORMAT_COLOR_FILL_PATH =
  "M19,11.5C19,11.5 17,13.67 17,15A2,2 0 0,0 19,17A2,2 0 0,0 21,15C21,13.67 19,11.5 19,11.5M5.21,10L10,5.21L14.79,10M16.56,8.94L7.62,0L6.21,1.41L8.59,3.79L3.44,8.94C2.85,9.5 2.85,10.47 3.44,11.06L8.94,16.56C9.23,16.85 9.62,17 10,17C10.38,17 10.77,16.85 11.06,16.56L16.56,11.06C17.15,10.47 17.15,9.5 16.56,8.94Z";
const HEXADECIMAL_PATH =
  "M7 7C5.9 7 5 7.9 5 9V15C5 16.11 5.9 17 7 17H9C10.11 17 11 16.11 11 15V9C11 7.9 10.11 7 9 7H7M7 9H9V15H7V9M17.6 17L15.5 14.9L13.4 17L12 15.6L14.1 13.5L12 11.4L13.4 10L15.5 12.1L17.6 10L19 11.4L16.9 13.5L19 15.6L17.6 17Z";

const CHROMATIC_STEPS = [100, 500, 900];
const FULL_STEPS = [100, 200, 300, 400, 500, 600, 700, 800, 900];
const PRIMITIVE_SCALES = [
  { hue: "red", steps: CHROMATIC_STEPS },
  { hue: "orange", steps: CHROMATIC_STEPS },
  { hue: "yellow", steps: CHROMATIC_STEPS },
  { hue: "green", steps: CHROMATIC_STEPS },
  { hue: "cyan", steps: CHROMATIC_STEPS },
  { hue: "blue", steps: CHROMATIC_STEPS },
  { hue: "purple", steps: CHROMATIC_STEPS },
  { hue: "magenta", steps: CHROMATIC_STEPS },
  { hue: "slate", steps: FULL_STEPS },
  { hue: "gold", steps: FULL_STEPS },
];

export const ElmColorPrimitiveSample = (
  props: ElmColorPrimitiveSampleProps,
) => {
  const [local, rest] = splitProps(props, ["class", "style"]);
  const copy = createColorSampleCopy();

  return (
    <div
      {...rest}
      class={clsx(styles["elm-color-primitive-sample"], local.class)}
      style={local.style}
      on:click={(event) => void copy.copyToken(event)}
    >
      <div class={styles.toolbar}>
        <button
          type="button"
          class={styles["mode-toggle"]}
          onClick={copy.toggleCopyMode}
        >
          <ElmMdiIcon
            class={styles["mode-toggle-icon"]}
            d={
              copy.copyMode() === "hex"
                ? HEXADECIMAL_PATH
                : FORMAT_COLOR_FILL_PATH
            }
            size="1.25rem"
          />
          Copy: {copy.copyMode() === "hex" ? "hex value" : "variable name"}
        </button>
      </div>

      <For each={PRIMITIVE_SCALES}>
        {(scale) => (
          <div class={styles.group}>
            <span class={styles["section-title"]}>{scale.hue}</span>
            <div class={styles.scale}>
              <For each={scale.steps}>
                {(step) => {
                  const token = `--elmethis-primitive-color-${scale.hue}-${step}`;
                  return (
                    <div
                      class={styles.swatch}
                      style={{ "grid-column": String(step / 100) }}
                      data-copy-token={token}
                      title={token}
                    >
                      <div
                        class={styles["swatch-bg"]}
                        style={{ "background-color": `var(${token})` }}
                      />
                      <code class={styles["swatch-name"]}>
                        {copy.copiedToken() === token ? "copied!" : step}
                      </code>
                    </div>
                  );
                }}
              </For>
            </div>
          </div>
        )}
      </For>
    </div>
  );
};
