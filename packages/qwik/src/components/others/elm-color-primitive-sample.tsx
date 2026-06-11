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
import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import { mdiFormatColorFill, mdiHexadecimal } from "@mdi/js";

export interface ElmColorPrimitiveSampleProps {
  class?: string;

  style?: CSSProperties;
}

type CopyMode = "variable" | "hex";

// Convert a computed `rgb(...)`/`rgba(...)` string into a `#rrggbb` hex code.
const rgbToHex = (rgb: string): string | null => {
  const parts = rgb.match(/\d+(\.\d+)?/g);
  if (!parts || parts.length < 3) return null;
  const channel = (n: string) =>
    Math.round(Number(n)).toString(16).padStart(2, "0");
  return `#${channel(parts[0])}${channel(parts[1])}${channel(parts[2])}`;
};

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
    // Whether clicking a swatch copies the CSS variable name or its resolved
    // hex value.
    const copyMode = useSignal<CopyMode>("variable");
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
      const target = (event.target as HTMLElement | null)?.closest(
        "[data-copy-token]",
      );
      const token = target?.getAttribute("data-copy-token");
      if (!target || !token) return;

      let text = token;
      if (copyMode.value === "hex") {
        const root = target.closest("[data-theme]") ?? document.documentElement;
        const probe = document.createElement("span");
        probe.style.color = `var(${token})`;
        probe.style.display = "none";
        root.appendChild(probe);
        const hex = rgbToHex(window.getComputedStyle(probe).color);
        probe.remove();
        if (hex) text = hex;
      }

      await window.navigator.clipboard.writeText(text);

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
        <div class={styles.toolbar}>
          <button
            type="button"
            class={styles["mode-toggle"]}
            onClick$={$(() => {
              copyMode.value =
                copyMode.value === "variable" ? "hex" : "variable";
            })}
          >
            <ElmMdiIcon
              class={styles["mode-toggle-icon"]}
              d={copyMode.value === "hex" ? mdiHexadecimal : mdiFormatColorFill}
              size={"1.25rem"}
            />
            Copy: {copyMode.value === "hex" ? "hex value" : "variable name"}
          </button>
        </div>

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
