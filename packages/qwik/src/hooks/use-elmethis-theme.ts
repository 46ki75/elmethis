import { $, useOnWindow, useSignal, useVisibleTask$ } from "@qwik.dev/core";

const LOCAL_STORAGE_KEY = "elmethis-theme";

type Theme = "light" | "dark";

/**
 * Coerce a raw storage value into a Theme. Exported so the (otherwise
 * inline) decision rule can be regression-tested directly without having
 * to dispatch a real `StorageEvent` through Qwik's resumable listener
 * system (which is not wired up under `createDOM`).
 *
 * Any value that is not literally `"dark"` — including `null` (the key was
 * cleared in another tab) and unknown strings — resolves to `"light"`.
 * This is the safest default for cross-tab sync: a cleared key should
 * land back on the platform-default theme rather than locking in dark.
 */
export const parseTheme = (raw: string | null): Theme =>
  raw === "dark" ? "dark" : "light";

// Pushes the theme into both the DOM (data-theme attribute + body
// colorScheme) and localStorage. Kept as a free function so every code path
// — toggle, initial mount, and cross-tab storage event — performs the same
// side-effects. Earlier versions had the storage handler update the signal
// only, which left the visible DOM out of sync with other tabs.
const applyTheme = (theme: Theme, persist: boolean): void => {
  document.documentElement.setAttribute("data-theme", theme);
  const body = document.querySelector("body");
  if (body != null) {
    body.style.colorScheme = theme;
  }
  if (persist && typeof localStorage !== "undefined") {
    localStorage.setItem(LOCAL_STORAGE_KEY, theme);
  }
};

export function useElmethisTheme() {
  const isDarkTheme = useSignal(false);

  const toggleTheme = $(() => {
    isDarkTheme.value = !isDarkTheme.value;
    if (typeof document === "undefined") return;
    applyTheme(isDarkTheme.value ? "dark" : "light", true);
  });

  // The `storage` event fires on `window`, not `document`. Listening on
  // `document` was a silent miss — every cross-tab update was dropped.
  useOnWindow(
    "storage",
    $((event: Event) => {
      const e = event as StorageEvent;
      if (e.key !== LOCAL_STORAGE_KEY) return;
      const next = parseTheme(e.newValue);
      isDarkTheme.value = next === "dark";
      // `persist: false` — the other tab already wrote to localStorage; we
      // just mirror the DOM here.
      applyTheme(next, false);
    }),
  );

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(
    () => {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored != null) {
        const theme = parseTheme(stored);
        isDarkTheme.value = theme === "dark";
        applyTheme(theme, false);
      } else {
        const current = document.documentElement.getAttribute("data-theme");
        if (current != null) {
          isDarkTheme.value = current === "dark";
        }
      }
    },
    { strategy: "document-ready" },
  );

  return { isDarkTheme, toggleTheme };
}
