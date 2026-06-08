import { component$, type CSSProperties } from "@qwik.dev/core";

import styles from "./elm-color-semantic-sample.module.css";

export interface ElmColorSemanticSampleProps {
  class?: string;

  style?: CSSProperties;
}

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

const ACCENT_PAIRS = [
  {
    fg: "--elmethis-color-accent-info",
    surface: "--elmethis-color-accent-info-surface",
  },
  {
    fg: "--elmethis-color-accent-success",
    surface: "--elmethis-color-accent-success-surface",
  },
  {
    fg: "--elmethis-color-accent-important",
    surface: "--elmethis-color-accent-important-surface",
  },
  {
    fg: "--elmethis-color-accent-warning",
    surface: "--elmethis-color-accent-warning-surface",
  },
  {
    fg: "--elmethis-color-accent-error",
    surface: "--elmethis-color-accent-error-surface",
  },
];

export const ElmColorSemanticSample = component$<ElmColorSemanticSampleProps>(
  ({ class: className, style }) => {
    const Render = component$((props: { theme: "light" | "dark" }) => {
      return (
        <html data-theme={props.theme}>
          <body
            style={{
              backgroundColor: "var(--elmethis-color-surface-base)",
            }}
          >
            <header
              class={styles.header}
              style={{
                backgroundColor: "var(--elmethis-color-surface-sunken)",
              }}
            >
              <span>--elmethis-color-surface-sunken</span>
            </header>

            <div class={styles.body}>
              <div class={styles.group}>
                <span class={styles["section-title"]}>Surface</span>
                {SURFACE_TOKENS.map((name) => (
                  <div
                    key={name}
                    class={styles.surface}
                    style={{ backgroundColor: `var(${name})` }}
                  >
                    {name}
                  </div>
                ))}
              </div>

              <div class={styles.group}>
                <span class={styles["section-title"]}>Foreground</span>
                {FOREGROUND_TOKENS.map((name) => (
                  <span
                    key={name}
                    class={styles.foreground}
                    style={{ color: `var(${name})` }}
                  >
                    {name}
                  </span>
                ))}
              </div>

              <div class={styles.group}>
                <span class={styles["section-title"]}>Accent</span>
                {ACCENT_PAIRS.map(({ fg, surface }) => (
                  <div
                    key={fg}
                    class={styles["accent-pair"]}
                    style={{
                      color: `var(${fg})`,
                      backgroundColor: `var(${surface})`,
                    }}
                  >
                    <span>{fg}</span>
                    <span>{surface}</span>
                  </div>
                ))}
              </div>
            </div>
          </body>
        </html>
      );
    });

    return (
      <div
        class={[styles["elm-color-semantic-sample"], className]}
        style={style}
      >
        <Render theme="light" />
        <Render theme="dark" />
      </div>
    );
  },
);
