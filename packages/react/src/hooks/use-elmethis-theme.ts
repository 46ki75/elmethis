import { useCallback, useEffect, useState } from "react";

const LOCAL_STORAGE_KEY = "elmethis-theme";

/**
 * Same-tab broadcast channel. Fired on `window` by `applyTheme` after every
 * theme mutation. Each `useElmethisTheme()` call owns an independent piece of
 * state, and the `storage` event only fires in *other* tabs — so without this
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
 * directly without having to dispatch a real `StorageEvent`.
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

/**
 * Pin or release the Elmethis theme natively via `color-scheme` + `data-theme`
 * on `<html>`, with cross-tab (`storage`) and same-tab (`CustomEvent`) sync.
 *
 * Unlike the qwik twin (which returns a `Signal<boolean>` plus a `QRL`), this
 * React port returns the plain idiom: `isDarkTheme` is a `boolean` and
 * `toggleTheme` is a `() => void`.
 *
 * @example
 *   const { isDarkTheme, toggleTheme } = useElmethisTheme();
 *   return <button onClick={toggleTheme}>{isDarkTheme ? "🌙" : "☀️"}</button>;
 */
/**
 * Resolve the initial dark-mode flag without touching the DOM. Runs once via
 * the lazy `useState` initializer so the mount effect never has to call
 * `setState` synchronously (which React 19 flags as a cascading render). Falls
 * back to `false` on the server, where neither `localStorage` nor `matchMedia`
 * exists.
 */
const initialIsDark = (): boolean => {
  if (typeof window === "undefined") return false;
  const stored = parseTheme(localStorage.getItem(LOCAL_STORAGE_KEY));
  // An explicit choice wins; otherwise mirror the OS so the toggle icon
  // reflects what `color-scheme: light dark` actually renders.
  return stored != null ? stored === "dark" : prefersDark();
};

export function useElmethisTheme() {
  const [isDarkTheme, setIsDarkTheme] = useState(initialIsDark);

  // No SSR guard needed — this is only invoked from a DOM click handler,
  // which by definition runs on the hydrated client.
  const toggleTheme = useCallback(() => {
    setIsDarkTheme((prev) => {
      const next = !prev;
      applyTheme(next ? "dark" : "light", true);
      return next;
    });
  }, []);

  useEffect(() => {
    // Same-tab sync: another hook instance (or this one) changed the theme via
    // `applyTheme`. Mirror the broadcast into this instance's state — writes
    // from `toggleTheme` are idempotent here, so re-entry is harmless.
    const onThemeChange = (event: Event) => {
      const theme = (event as CustomEvent<Theme | null>).detail;
      setIsDarkTheme(theme != null ? theme === "dark" : prefersDark());
    };

    // The `storage` event fires on `window`, not `document`. Listening on
    // `document` was a silent miss — every cross-tab update was dropped.
    const onStorage = (event: StorageEvent) => {
      if (event.key !== LOCAL_STORAGE_KEY) return;
      const next = parseTheme(event.newValue);
      // A cleared key (next == null) reverts to the OS preference rather than
      // locking in a theme; mirror that in both the state and the DOM.
      setIsDarkTheme(next != null ? next === "dark" : prefersDark());
      // `persist: false` — the other tab already wrote to localStorage; we
      // just mirror the DOM here.
      applyTheme(next, false);
    };

    window.addEventListener(THEME_CHANGE_EVENT, onThemeChange);
    window.addEventListener("storage", onStorage);

    // Mirror the (already-resolved) initial state into the DOM. The flag was
    // computed in the lazy `useState` initializer, so we only need the DOM
    // side-effect here — no synchronous `setState`. A persisted choice gets
    // pinned; with no explicit choice we leave `color-scheme: light dark` in
    // place so the page follows the OS natively.
    const stored = parseTheme(localStorage.getItem(LOCAL_STORAGE_KEY));
    if (stored != null) {
      applyTheme(stored, false);
    }

    // In auto mode the page restyles natively when the OS preference flips
    // (light-dark() tracks `color-scheme: light dark`), but nothing touches
    // the DOM or storage, so no event reaches the mirrors above. Listen to
    // the media query directly; a pinned theme overrides `color-scheme`, so
    // defer to localStorage before mirroring.
    let mql: MediaQueryList | undefined;
    const onOsChange = (e: MediaQueryListEvent) => {
      if (parseTheme(localStorage.getItem(LOCAL_STORAGE_KEY)) == null) {
        setIsDarkTheme(e.matches);
      }
    };
    if (typeof matchMedia !== "undefined") {
      mql = matchMedia("(prefers-color-scheme: dark)");
      mql.addEventListener("change", onOsChange);
    }

    return () => {
      window.removeEventListener(THEME_CHANGE_EVENT, onThemeChange);
      window.removeEventListener("storage", onStorage);
      mql?.removeEventListener("change", onOsChange);
    };
  }, []);

  return { isDarkTheme, toggleTheme };
}
