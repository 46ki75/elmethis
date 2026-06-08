import { component$, type CSSProperties } from "@qwik.dev/core";

import styles from "./elm-color-token-sample.module.css";
import { ElmInlineText } from "../typography/elm-inline-text";

export interface ElmColorTokenSampleProps {
  class?: string;

  style?: CSSProperties;
}

const ColorSample = component$((args: { variables: string[] }) => {
  return (
    <div class={styles["color-sample-container"]}>
      {args.variables.map((variable) => (
        <div class={styles["color-sample"]}>
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

export const ElmColorTokenSample = component$<ElmColorTokenSampleProps>(
  ({ class: className, style }) => {
    const Render = component$((props: { theme: "light" | "dark" }) => {
      return (
        <html data-theme={props.theme}>
          <body>
            <header
              class={styles.header}
              style={{
                backgroundColor: "var(--elmethis-color-surface-sunken)",
              }}
            >
              <span>--elmethis-color-surface-sunken</span>
            </header>

            <div style={{ textAlign: "center", color: "gray" }}>
              --elmethis-color-bg
            </div>

            <div class={styles.body}>
              {[
                "--elmethis-color-neutral-weak",
                "--elmethis-color-neutral",
                "--elmethis-color-neutral-strong",
                "--elmethis-color-primary-weak",
                "--elmethis-color-primary",
                "--elmethis-color-primary-strong",
                "--elmethis-color-accent-info",
                "--elmethis-color-accent-success",
                "--elmethis-color-accent-important",
                "--elmethis-color-accent-warning",
                "--elmethis-color-accent-error",
                "--elmethis-color-accent-link",
                "--elmethis-color-accent-link-visited",
              ].map((name) => (
                <div
                  key={name}
                  style={{
                    color: `var(${name})`,
                  }}
                >
                  {name}
                </div>
              ))}

              {[
                "--elmethis-color-surface-raised",
                "--elmethis-color-surface-sunken",
              ].map((name) => (
                <div
                  key={name}
                  class={styles.container}
                  style={{
                    backgroundColor: `var(${name})`,
                  }}
                >
                  {name}
                </div>
              ))}

              <div>
                <ColorSample
                  variables={[
                    "--elmethis-color-red",
                    "--elmethis-color-orange",
                    "--elmethis-color-yellow",
                    "--elmethis-color-green",
                    "--elmethis-color-cyan",
                    "--elmethis-color-blue",
                    "--elmethis-color-purple",
                    "--elmethis-color-magenta",
                  ]}
                />
              </div>
            </div>

            <footer
              class={styles.footer}
              style={{
                backgroundColor: "var(--elmethis-color-bg)",
              }}
            >
              <span>--elmethis-color-bg</span>
            </footer>
          </body>
        </html>
      );
    });

    return (
      <div class={[styles["elm-color-token-sample"], className]} style={style}>
        <Render theme="light" />
        <Render theme="dark" />
      </div>
    );
  },
);
