import {
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type MouseEvent,
} from "react";
import { clsx } from "clsx";
import { mdiFormatColorFill, mdiHexadecimal } from "@mdi/js";

import styles from "./elm-color-semantic-sample.module.css";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";

export interface ElmColorSemanticSampleProps extends ComponentPropsWithoutRef<"div"> {}

type CopyMode = "variable" | "hex";

// Convert a computed `rgb(...)`/`rgba(...)` string into a `#rrggbb` hex code.
const rgbToHex = (rgb: string): string | null => {
  const parts = rgb.match(/\d+(\.\d+)?/g);
  if (!parts || parts.length < 3) return null;
  const channel = (n: string) =>
    Math.round(Number(n)).toString(16).padStart(2, "0");
  return `#${channel(parts[0])}${channel(parts[1])}${channel(parts[2])}`;
};

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

const DISPLAY_PAIRS = [
  "red",
  "orange",
  "yellow",
  "green",
  "cyan",
  "blue",
  "magenta",
].map((hue) => ({
  fg: `--elmethis-color-display-${hue}`,
  surface: `--elmethis-color-display-${hue}-surface`,
}));

const ColorSample = ({
  variables,
  copiedToken,
}: {
  variables: string[];
  copiedToken: string | null;
}) => {
  return (
    <div className={styles["color-sample-container"]}>
      {variables.map((variable) => (
        <div
          key={variable}
          className={styles["color-sample"]}
          data-copy-token={variable}
        >
          <div
            className={styles["color-sample-bg"]}
            style={{ backgroundColor: `var(${variable})` }}
          ></div>
          <code className={styles["color-sample-name"]}>
            {copiedToken === variable ? "copied!" : variable}
          </code>
        </div>
      ))}
    </div>
  );
};

export const ElmColorSemanticSample = ({
  className,
  style,
  ...props
}: ElmColorSemanticSampleProps) => {
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  // Whether clicking a swatch copies the CSS variable name or its resolved
  // hex value (resolved per the swatch's own theme via light-dark()).
  const [copyMode, setCopyMode] = useState<CopyMode>("variable");
  // Active reset timer. Copying another token before the previous reset
  // fires must cancel the older timer — otherwise it would clear the new
  // feedback mid-way through its window.
  const resetTimerId = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  // Unmount-only cleanup so a pending reset doesn't fire on a disposed host.
  useEffect(() => {
    return () => {
      if (resetTimerId.current !== undefined) {
        clearTimeout(resetTimerId.current);
      }
    };
  }, []);

  // Single delegated handler on the panels root.
  const copyToken = async (event: MouseEvent<HTMLDivElement>) => {
    const target = (event.target as HTMLElement | null)?.closest(
      "[data-copy-token]",
    );
    const token = target?.getAttribute("data-copy-token");
    if (!target || !token) return;

    let text = token;
    if (copyMode === "hex") {
      // Resolve the variable inside its own theme root so light-dark()
      // returns the value matching the swatch the user actually clicked.
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

    if (resetTimerId.current !== undefined) {
      clearTimeout(resetTimerId.current);
    }
    setCopiedToken(token);
    resetTimerId.current = setTimeout(() => {
      setCopiedToken(null);
      resetTimerId.current = undefined;
    }, 1500);
  };

  const renderPanel = (theme: "light" | "dark") => {
    const label = (name: string) => (copiedToken === name ? "copied!" : name);

    return (
      // `color-scheme` drives native light-dark() token resolution;
      // `data-theme` covers the few non-color overrides that can't use it.
      // Plain elements (not <html>/<body>) so the sample can be nested
      // inside a page; `color-scheme`/`data-theme` apply to any element.
      <div
        className={styles.panel}
        data-theme={theme}
        style={{ colorScheme: theme }}
      >
        <div
          className={styles["panel-body"]}
          style={{ backgroundColor: "var(--elmethis-color-surface-base)" }}
        >
          <header
            className={styles.header}
            style={{
              backgroundColor: "var(--elmethis-color-surface-sunken)",
            }}
          >
            <span data-copy-token="--elmethis-color-surface-sunken">
              {label("--elmethis-color-surface-sunken")}
            </span>
          </header>

          <div className={styles.body}>
            <div className={styles.group}>
              <span className={styles["section-title"]}>Surface</span>
              {SURFACE_TOKENS.map((name) => (
                <div
                  key={name}
                  className={styles.surface}
                  style={{ backgroundColor: `var(${name})` }}
                  data-copy-token={name}
                >
                  {label(name)}
                </div>
              ))}
            </div>

            <div className={styles.group}>
              <span className={styles["section-title"]}>Foreground</span>
              {FOREGROUND_TOKENS.map((name) => (
                <span
                  key={name}
                  className={styles.foreground}
                  style={{ color: `var(${name})` }}
                  data-copy-token={name}
                >
                  {label(name)}
                </span>
              ))}
            </div>

            <div className={styles.group}>
              <span className={styles["section-title"]}>Accent</span>
              {ACCENT_PAIRS.map(({ fg, surface }) => (
                <div
                  key={fg}
                  className={styles["accent-pair"]}
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

            <div className={styles.group}>
              <span className={styles["section-title"]}>Neutral</span>
              <ColorSample
                variables={NEUTRAL_TOKENS}
                copiedToken={copiedToken}
              />
            </div>

            <div className={styles.group}>
              <span className={styles["section-title"]}>Primary</span>
              <ColorSample
                variables={PRIMARY_TOKENS}
                copiedToken={copiedToken}
              />
            </div>

            <div className={styles.group}>
              <span className={styles["section-title"]}>Display</span>
              {DISPLAY_PAIRS.map(({ fg, surface }) => (
                <div
                  key={fg}
                  className={styles["accent-pair"]}
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
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={clsx(styles["elm-color-semantic-sample"], className)}
      style={style as CSSProperties}
      {...props}
    >
      <div className={styles.toolbar}>
        <button
          type="button"
          className={styles["mode-toggle"]}
          onClick={() =>
            setCopyMode((mode) => (mode === "variable" ? "hex" : "variable"))
          }
        >
          <ElmMdiIcon
            className={styles["mode-toggle-icon"]}
            d={copyMode === "hex" ? mdiHexadecimal : mdiFormatColorFill}
            size={"1.25rem"}
          />
          Copy: {copyMode === "hex" ? "hex value" : "variable name"}
        </button>
      </div>

      <div className={styles.panels} onClick={copyToken}>
        {renderPanel("light")}
        {renderPanel("dark")}
      </div>
    </div>
  );
};
