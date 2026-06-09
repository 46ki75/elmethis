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

const PRIMITIVE_TOKENS = [
  "--elmethis-primitive-color-red-500",
  "--elmethis-primitive-color-orange-500",
  "--elmethis-primitive-color-yellow-500",
  "--elmethis-primitive-color-green-500",
  "--elmethis-primitive-color-cyan-500",
  "--elmethis-primitive-color-blue-500",
  "--elmethis-primitive-color-purple-500",
  "--elmethis-primitive-color-magenta-500",
];

const ColorSample = component$((args: { variables: string[] }) => {
  return (
    <div class={styles["color-sample-container"]}>
      {args.variables.map((variable) => (
        <div key={variable} class={styles["color-sample"]}>
          <div
            class={styles["color-sample-bg"]}
            style={{
              backgroundColor: `var(${variable})`,
            }}
          ></div>
          <code class={styles["color-sample-name"]}>{variable}</code>
        </div>
      ))}
    </div>
  );
});

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
        // `color-scheme` drives native light-dark() token resolution;
        // `data-theme` covers the few non-color overrides that can't use it.
        <html data-theme={props.theme} style={{ colorScheme: props.theme }}>
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

              <div class={styles.group}>
                <span class={styles["section-title"]}>Neutral</span>
                <ColorSample variables={NEUTRAL_TOKENS} />
              </div>

              <div class={styles.group}>
                <span class={styles["section-title"]}>Primary</span>
                <ColorSample variables={PRIMARY_TOKENS} />
              </div>

              <div class={styles.group}>
                <span class={styles["section-title"]}>Primitive</span>
                <ColorSample variables={PRIMITIVE_TOKENS} />
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
