import {
  $,
  component$,
  noSerialize,
  useSignal,
  useTask$,
  type CSSProperties,
  type NoSerialize,
} from "@qwik.dev/core";

import styles from "./elm-color-primitive-sample.module.css";

export interface ElmColorPrimitiveSampleProps {
  class?: string;

  style?: CSSProperties;
}

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

export const ElmColorPrimitiveSample = component$<ElmColorPrimitiveSampleProps>(
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

    return (
      <div
        class={[styles["elm-color-primitive-sample"], className]}
        style={style}
        onClick$={copyToken$}
      >
        {PRIMITIVE_SCALES.map(({ hue, steps }) => (
          <div key={hue} class={styles.group}>
            <span class={styles["section-title"]}>{hue}</span>
            <div class={styles.scale}>
              {steps.map((step) => {
                const token = `--elmethis-primitive-color-${hue}-${step}`;
                return (
                  <div
                    key={token}
                    class={styles.swatch}
                    // Align each step to its scale position so sparse
                    // (100/500/900) and full rows share columns.
                    style={{ gridColumn: String(step / 100) }}
                    data-copy-token={token}
                    title={token}
                  >
                    <div
                      class={styles["swatch-bg"]}
                      style={{ backgroundColor: `var(${token})` }}
                    ></div>
                    <code class={styles["swatch-name"]}>
                      {copiedToken.value === token ? "copied!" : step}
                    </code>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  },
);
