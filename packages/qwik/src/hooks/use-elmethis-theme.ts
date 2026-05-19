import { $, useOnWindow, useSignal, useVisibleTask$ } from "@qwik.dev/core";

const LOCAL_STORAGE_KEY = "elmethis-theme";

type Theme = "light" | "dark";

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
      const next: Theme = e.newValue === "dark" ? "dark" : "light";
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
        const theme: Theme = stored === "dark" ? "dark" : "light";
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
