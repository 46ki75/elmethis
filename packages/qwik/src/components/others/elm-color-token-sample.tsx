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
              <div
                style={{
                  color: "var(--elmethis-color-mono-fg-weak)",
                }}
              >
                --elmethis-color-mono-fg-weak
              </div>
              <div style={{ color: "var(--elmethis-color-mono-fg)" }}>
                --elmethis-color-mono-fg
              </div>
              <div
                style={{
                  color: "var(--elmethis-color-mono-fg-strong)",
                }}
              >
                --elmethis-color-mono-fg-strong
              </div>

              <div style={{ color: "var(--elmethis-color-primary-fg-weak)" }}>
                --elmethis-color-primary-fg-weak
              </div>
              <div style={{ color: "var(--elmethis-color-primary-fg)" }}>
                --elmethis-color-primary-fg
              </div>
              <div style={{ color: "var(--elmethis-color-primary-fg-strong)" }}>
                --elmethis-color-primary-fg-strong
              </div>

              <div
                class={styles.container}
                style={{
                  backgroundColor:
                    "var(--elmethis-color-mono-container-default)",
                }}
              >
                <ElmInlineText>
                  --elmethis-color-mono-container-default
                </ElmInlineText>
              </div>
              <div
                class={styles.container}
                style={{
                  backgroundColor:
                    "var(--elmethis-color-mono-container-enabled)",
                }}
              >
                <ElmInlineText>
                  --elmethis-color-mono-container-enabled
                </ElmInlineText>
              </div>
              <div
                class={styles.container}
                style={{
                  backgroundColor:
                    "var(--elmethis-color-mono-container-disabled)",
                }}
              >
                <ElmInlineText>
                  --elmethis-color-mono-container-disabled
                </ElmInlineText>
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
