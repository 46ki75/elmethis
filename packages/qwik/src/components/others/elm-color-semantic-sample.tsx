import {
  $,
  component$,
  noSerialize,
  useSignal,
  useTask$,
  type CSSProperties,
  type NoSerialize,
  type Signal,
} from "@qwik.dev/core";

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

const ColorSample = component$(
  (args: { variables: string[]; copiedToken: Signal<string | null> }) => {
    return (
      <div class={styles["color-sample-container"]}>
        {args.variables.map((variable) => (
          <div
            key={variable}
            class={styles["color-sample"]}
            data-copy-token={variable}
          >
            <div
              class={styles["color-sample-bg"]}
              style={{
                backgroundColor: `var(${variable})`,
              }}
            ></div>
            <code class={styles["color-sample-name"]}>
              {args.copiedToken.value === variable ? "copied!" : variable}
            </code>
          </div>
        ))}
      </div>
    );
  },
);

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
    const copiedToken = useSignal<string | null>(null);
    // Active reset timer. Copying another token before the previous reset
    // fires must cancel the older timer — otherwise it would clear the new
    // feedback mid-way through its window.
    const resetTimerId = useSignal<
      NoSerialize<ReturnType<typeof setTimeout>> | undefined
    >(undefined);

    // Unmount-only cleanup so a pending reset doesn't fire on a disposed host.
    useTask$(({ cleanup }) => {
      cleanup(() => {
        if (resetTimerId.value !== undefined) clearTimeout(resetTimerId.value);
      });
    });

    // Single delegated handler on the component root; per-item QRLs inside
    // JSX iteration over-capture in dev mode.
    const copyToken$ = $(async (event: Event) => {
      const token = (event.target as HTMLElement | null)
        ?.closest("[data-copy-token]")
        ?.getAttribute("data-copy-token");
      if (!token) return;

      await window.navigator.clipboard.writeText(token);

      if (resetTimerId.value !== undefined) {
        clearTimeout(resetTimerId.value);
      }
      copiedToken.value = token;
      resetTimerId.value = noSerialize(
        setTimeout(() => {
          copiedToken.value = null;
          resetTimerId.value = undefined;
        }, 1500),
      );
    });

    const Render = component$((props: { theme: "light" | "dark" }) => {
      const label = (name: string) =>
        copiedToken.value === name ? "copied!" : name;

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
              <span data-copy-token="--elmethis-color-surface-sunken">
                {label("--elmethis-color-surface-sunken")}
              </span>
            </header>

            <div class={styles.body}>
              <div class={styles.group}>
                <span class={styles["section-title"]}>Surface</span>
                {SURFACE_TOKENS.map((name) => (
                  <div
                    key={name}
                    class={styles.surface}
                    style={{ backgroundColor: `var(${name})` }}
                    data-copy-token={name}
                  >
                    {label(name)}
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
                    data-copy-token={name}
                  >
                    {label(name)}
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
                    <span data-copy-token={fg}>{label(fg)}</span>
                    <span data-copy-token={surface}>{label(surface)}</span>
                  </div>
                ))}
              </div>

              <div class={styles.group}>
                <span class={styles["section-title"]}>Neutral</span>
                <ColorSample
                  variables={NEUTRAL_TOKENS}
                  copiedToken={copiedToken}
                />
              </div>

              <div class={styles.group}>
                <span class={styles["section-title"]}>Primary</span>
                <ColorSample
                  variables={PRIMARY_TOKENS}
                  copiedToken={copiedToken}
                />
              </div>

              <div class={styles.group}>
                <span class={styles["section-title"]}>Primitive</span>
                <ColorSample
                  variables={PRIMITIVE_TOKENS}
                  copiedToken={copiedToken}
                />
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
        onClick$={copyToken$}
      >
        <Render theme="light" />
        <Render theme="dark" />
      </div>
    );
  },
);
