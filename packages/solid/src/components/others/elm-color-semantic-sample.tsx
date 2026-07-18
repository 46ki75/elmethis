import { For, splitProps, type JSX } from "solid-js";
import { clsx } from "clsx";

import styles from "./elm-color-semantic-sample.module.css";
import { createColorSampleCopy } from "./color-sample-copy";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";

export type ElmColorSemanticSampleProps = JSX.HTMLAttributes<HTMLDivElement>;

const FORMAT_COLOR_FILL_PATH =
  "M19,11.5C19,11.5 17,13.67 17,15A2,2 0 0,0 19,17A2,2 0 0,0 21,15C21,13.67 19,11.5 19,11.5M5.21,10L10,5.21L14.79,10M16.56,8.94L7.62,0L6.21,1.41L8.59,3.79L3.44,8.94C2.85,9.5 2.85,10.47 3.44,11.06L8.94,16.56C9.23,16.85 9.62,17 10,17C10.38,17 10.77,16.85 11.06,16.56L16.56,11.06C17.15,10.47 17.15,9.5 16.56,8.94Z";
const HEXADECIMAL_PATH =
  "M7 7C5.9 7 5 7.9 5 9V15C5 16.11 5.9 17 7 17H9C10.11 17 11 16.11 11 15V9C11 7.9 10.11 7 9 7H7M7 9H9V15H7V9M17.6 17L15.5 14.9L13.4 17L12 15.6L14.1 13.5L12 11.4L13.4 10L15.5 12.1L17.6 10L19 11.4L16.9 13.5L19 15.6L17.6 17Z";

const SURFACE_TOKENS = [
  "--elmethis-color-surface-sunken",
  "--elmethis-color-surface-base",
  "--elmethis-color-surface-raised",
];
const FOREGROUND_TOKENS = [
  "--elmethis-color-neutral-weak",
  "--elmethis-color-neutral",
  "--elmethis-color-neutral-strong",
  "--elmethis-color-primary-weak",
  "--elmethis-color-primary",
  "--elmethis-color-primary-strong",
  "--elmethis-color-accent-link",
  "--elmethis-color-accent-link-visited",
];
const NEUTRAL_TOKENS = [
  "--elmethis-color-neutral-weak",
  "--elmethis-color-neutral",
  "--elmethis-color-neutral-strong",
];
const PRIMARY_TOKENS = [
  "--elmethis-color-primary-weak",
  "--elmethis-color-primary",
  "--elmethis-color-primary-strong",
];
const ACCENT_PAIRS = [
  {
    foreground: "--elmethis-color-accent-info",
    surface: "--elmethis-color-accent-info-surface",
  },
  {
    foreground: "--elmethis-color-accent-success",
    surface: "--elmethis-color-accent-success-surface",
  },
  {
    foreground: "--elmethis-color-accent-important",
    surface: "--elmethis-color-accent-important-surface",
  },
  {
    foreground: "--elmethis-color-accent-warning",
    surface: "--elmethis-color-accent-warning-surface",
  },
  {
    foreground: "--elmethis-color-accent-error",
    surface: "--elmethis-color-accent-error-surface",
  },
];
const DISPLAY_PAIRS = [
  "red",
  "orange",
  "yellow",
  "green",
  "cyan",
  "blue",
  "magenta",
].map((hue) => ({
  foreground: `--elmethis-color-display-${hue}`,
  surface: `--elmethis-color-display-${hue}-surface`,
}));

export const ElmColorSemanticSample = (props: ElmColorSemanticSampleProps) => {
  const [local, rest] = splitProps(props, ["class", "style"]);
  const copy = createColorSampleCopy();
  const label = (token: string) =>
    copy.copiedToken() === token ? "copied!" : token;

  const colorSample = (variables: string[]) => (
    <div class={styles["color-sample-container"]}>
      <For each={variables}>
        {(variable) => (
          <div class={styles["color-sample"]} data-copy-token={variable}>
            <div
              class={styles["color-sample-bg"]}
              style={{ "background-color": `var(${variable})` }}
            />
            <code class={styles["color-sample-name"]}>{label(variable)}</code>
          </div>
        )}
      </For>
    </div>
  );

  const panel = (theme: "light" | "dark") => (
    <div
      class={styles.panel}
      data-theme={theme}
      style={{ "color-scheme": theme }}
    >
      <div
        class={styles["panel-body"]}
        style={{ "background-color": "var(--elmethis-color-surface-base)" }}
      >
        <header
          class={styles.header}
          style={{
            "background-color": "var(--elmethis-color-surface-sunken)",
          }}
        >
          <span data-copy-token="--elmethis-color-surface-sunken">
            {label("--elmethis-color-surface-sunken")}
          </span>
        </header>

        <div class={styles.body}>
          <div class={styles.group}>
            <span class={styles["section-title"]}>Surface</span>
            <For each={SURFACE_TOKENS}>
              {(name) => (
                <div
                  class={styles.surface}
                  style={{ "background-color": `var(${name})` }}
                  data-copy-token={name}
                >
                  {label(name)}
                </div>
              )}
            </For>
          </div>

          <div class={styles.group}>
            <span class={styles["section-title"]}>Foreground</span>
            <For each={FOREGROUND_TOKENS}>
              {(name) => (
                <span
                  class={styles.foreground}
                  style={{ color: `var(${name})` }}
                  data-copy-token={name}
                >
                  {label(name)}
                </span>
              )}
            </For>
          </div>

          <div class={styles.group}>
            <span class={styles["section-title"]}>Accent</span>
            <For each={ACCENT_PAIRS}>
              {(pair) => (
                <div
                  class={styles["accent-pair"]}
                  style={{
                    color: `var(${pair.foreground})`,
                    "background-color": `var(${pair.surface})`,
                  }}
                >
                  <span data-copy-token={pair.foreground}>
                    {label(pair.foreground)}
                  </span>
                  <span data-copy-token={pair.surface}>
                    {label(pair.surface)}
                  </span>
                </div>
              )}
            </For>
          </div>

          <div class={styles.group}>
            <span class={styles["section-title"]}>Neutral</span>
            {colorSample(NEUTRAL_TOKENS)}
          </div>

          <div class={styles.group}>
            <span class={styles["section-title"]}>Primary</span>
            {colorSample(PRIMARY_TOKENS)}
          </div>

          <div class={styles.group}>
            <span class={styles["section-title"]}>Display</span>
            <For each={DISPLAY_PAIRS}>
              {(pair) => (
                <div
                  class={styles["accent-pair"]}
                  style={{
                    color: `var(${pair.foreground})`,
                    "background-color": `var(${pair.surface})`,
                  }}
                >
                  <span data-copy-token={pair.foreground}>
                    {label(pair.foreground)}
                  </span>
                  <span data-copy-token={pair.surface}>
                    {label(pair.surface)}
                  </span>
                </div>
              )}
            </For>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div
      {...rest}
      class={clsx(styles["elm-color-semantic-sample"], local.class)}
      style={local.style}
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

      <div
        class={styles.panels}
        onClick={(event) => void copy.copyToken(event)}
      >
        {panel("light")}
        {panel("dark")}
      </div>
    </div>
  );
};
