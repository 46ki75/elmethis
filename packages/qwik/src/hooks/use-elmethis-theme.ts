import { $, useOnWindow, useSignal, useVisibleTask$ } from "@qwik.dev/core";

const LOCAL_STORAGE_KEY = "elmethis-theme";

/**
 * Same-tab broadcast channel. Fired on `window` by `applyTheme` after every
 * theme mutation. Each `useElmethisTheme()` call owns an independent signal,
 * and the `storage` event only fires in *other* tabs — so without this
 * event, sibling components in the same tab would never see a toggle.
 * `detail` carries the new `Theme | null` (`null` = reverted to OS auto).
 */
export const THEME_CHANGE_EVENT = "elmethis-theme-change";

type Theme = "light" | "dark";

/**
 * Coerce a raw storage value into an explicit Theme, or `null` when no
 * explicit choice is stored. `null` means "follow the OS" — i.e. fall back
 * to the `color-scheme: light dark` default, which tracks
 * `prefers-color-scheme`.
 *
 * Exported so the (otherwise inline) decision rule can be regression-tested
 * directly without having to dispatch a real `StorageEvent` through Qwik's
 * resumable listener system (which is not wired up under `createDOM`).
 *
 * Only the literal strings `"dark"` and `"light"` are explicit choices;
 * anything else — including `null` (the key was cleared in another tab) and
 * unknown strings — resolves to `null` (auto / OS).
 */
export const parseTheme = (raw: string | null): Theme | null =>
  raw === "dark" ? "dark" : raw === "light" ? "light" : null;

/** Whether the OS currently prefers a dark color scheme. */
const prefersDark = (): boolean =>
  typeof matchMedia !== "undefined" &&
  matchMedia("(prefers-color-scheme: dark)").matches;

// Theme switching is native: every themed token is a `light-dark()` value
// that resolves against the root's computed `color-scheme`. Pinning a theme
// is therefore just overriding `color-scheme` on the root element.
//
// `data-theme` is also written for the handful of *non-color* overrides
// (e.g. ElmParallax opacity, ElmInlineIcon selection filter) that can't use
// light-dark(); those rules read `[data-theme="light" | "dark"]` to follow an
// explicit pin, and `@media (prefers-color-scheme)` to follow the OS default.
//
// Kept as a free function so every code path — toggle, initial mount, and
// cross-tab storage event — performs the same side-effects.
const applyTheme = (theme: Theme | null, persist: boolean): void => {
  const root = document.documentElement;
  if (theme == null) {
    // Revert to the OS-driven default (`color-scheme: light dark`).
    root.style.removeProperty("color-scheme");
    root.removeAttribute("data-theme");
    if (persist && typeof localStorage !== "undefined") {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  } else {
    root.style.colorScheme = theme;
    root.setAttribute("data-theme", theme);
    if (persist && typeof localStorage !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_KEY, theme);
    }
  }
  // Broadcast after the DOM/storage writes so listeners observe final state.
  window.dispatchEvent(
    new CustomEvent<Theme | null>(THEME_CHANGE_EVENT, { detail: theme }),
  );
};

export function useElmethisTheme() {
  const isDarkTheme = useSignal(false);

  // No SSR guard needed — this QRL is only invoked from a DOM click
  // handler, which by definition runs on the hydrated client.
  const toggleTheme = $(() => {
    isDarkTheme.value = !isDarkTheme.value;
    applyTheme(isDarkTheme.value ? "dark" : "light", true);
  });

  // Same-tab sync: another hook instance (or this one) changed the theme via
  // `applyTheme`. Mirror the broadcast into this instance's signal — writes
  // from `toggleTheme` are idempotent here, so re-entry is harmless.
  useOnWindow(
    THEME_CHANGE_EVENT,
    $((event: Event) => {
      const theme = (event as CustomEvent<Theme | null>).detail;
      isDarkTheme.value = theme != null ? theme === "dark" : prefersDark();
    }),
  );

  // The `storage` event fires on `window`, not `document`. Listening on
  // `document` was a silent miss — every cross-tab update was dropped.
  useOnWindow(
    "storage",
    $((event: Event) => {
      const e = event as StorageEvent;
      if (e.key !== LOCAL_STORAGE_KEY) return;
      const next = parseTheme(e.newValue);
      // A cleared key (next == null) reverts to the OS preference rather than
      // locking in a theme; mirror that in both the signal and the DOM.
      isDarkTheme.value = next != null ? next === "dark" : prefersDark();
      // `persist: false` — the other tab already wrote to localStorage; we
      // just mirror the DOM here.
      applyTheme(next, false);
    }),
  );

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(
    ({ cleanup }) => {
      const stored = parseTheme(localStorage.getItem(LOCAL_STORAGE_KEY));
      if (stored != null) {
        // An explicit choice was persisted — pin it.
        isDarkTheme.value = stored === "dark";
        applyTheme(stored, false);
      } else {
        // No explicit choice: leave `color-scheme: light dark` in place so the
        // page follows the OS natively. Only mirror the OS into the signal so
        // the toggle icon reflects what's actually rendered.
        isDarkTheme.value = prefersDark();
      }

      // In auto mode the page restyles natively when the OS preference flips
      // (light-dark() tracks `color-scheme: light dark`), but nothing touches
      // the DOM or storage, so no event reaches the mirrors above. Listen to
      // the media query directly; a pinned theme overrides `color-scheme`, so
      // defer to localStorage before mirroring.
      if (typeof matchMedia !== "undefined") {
        const mql = matchMedia("(prefers-color-scheme: dark)");
        const onOsChange = (e: MediaQueryListEvent) => {
          if (parseTheme(localStorage.getItem(LOCAL_STORAGE_KEY)) == null) {
            isDarkTheme.value = e.matches;
          }
        };
        mql.addEventListener("change", onOsChange);
        cleanup(() => mql.removeEventListener("change", onOsChange));
      }
    },
    { strategy: "document-ready" },
  );

  return { isDarkTheme, toggleTheme };
}
