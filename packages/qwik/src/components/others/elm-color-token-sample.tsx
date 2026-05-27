import { component$, type CSSProperties } from "@qwik.dev/core";

import styles from "./elm-color-token-sample.module.css";
import { ElmInlineText } from "../typography/elm-inline-text";

export interface ElmColorTokenSampleProps {
  class?: string;

  style?: CSSProperties;
}

export const ElmColorTokenSample = component$<ElmColorTokenSampleProps>(
  ({ class: className, style }) => {
    const Render = component$((props: { theme: "light" | "dark" }) => {
      return (
        <html data-theme={props.theme}>
          <body>
            <header
              class={styles.header}
              style={{
                backgroundColor: "var(--elmethis-color-bg-strong)",
              }}
            >
              <span>--elmethis-color-bg-strong</span>
            </header>

            <div style={{ textAlign: "center", color: "gray" }}>
              --elmethis-color-bg-weak
            </div>

            <div class={styles.body}>
              {[
                "--elmethis-color-mono-fg-weak",
                "--elmethis-color-mono-fg",
                "--elmethis-color-mono-fg-strong",
                "--elmethis-color-primary-fg-weak",
                "--elmethis-color-primary-fg",
                "--elmethis-color-primary-fg-strong",
                "--elmethis-accent-info",
                "--elmethis-accent-success",
                "--elmethis-accent-important",
                "--elmethis-accent-warning",
                "--elmethis-accent-error",
                "--elmethis-accent-link",
                "--elmethis-accent-link-visited",
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
                "--elmethis-color-mono-container-default",
                "--elmethis-color-mono-container-enabled",
                "--elmethis-color-mono-container-disabled",
              ].map((name) => (
                <div
                  key={name}
                  class={styles.container}
                  style={{
                    backgroundColor: `var(${name})`,
                  }}
                >
                  <ElmInlineText>{name}</ElmInlineText>
                </div>
              ))}
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
