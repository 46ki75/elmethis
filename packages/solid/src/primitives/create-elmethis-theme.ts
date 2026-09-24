import { createSignal, onCleanup, onMount, type Accessor } from "solid-js";

const LOCAL_STORAGE_KEY = "elmethis-theme";
const DARK_MEDIA_QUERY = "(prefers-color-scheme: dark)";

export const THEME_CHANGE_EVENT = "elmethis-theme-change";

export type ElmethisTheme = "light" | "dark";

export interface ElmethisThemeController {
  /** The resolved theme. It is deterministically false until client mount. */
  isDarkTheme: Accessor<boolean>;
  /** Pins the opposite of the currently resolved theme. */
  toggleTheme: () => void;
}

const parseTheme = (raw: string | null): ElmethisTheme | null =>
  raw === "dark" ? "dark" : raw === "light" ? "light" : null;

const readStoredTheme = (): ElmethisTheme | null => {
  try {
    return parseTheme(window.localStorage.getItem(LOCAL_STORAGE_KEY));
  } catch {
    return null;
  }
};

const applyTheme = (theme: ElmethisTheme | null, persist: boolean): void => {
  const root = document.documentElement;

  if (theme === null) {
    root.style.removeProperty("color-scheme");
    root.removeAttribute("data-theme");
  } else {
    root.style.colorScheme = theme;
    root.setAttribute("data-theme", theme);
  }

  if (persist) {
    try {
      if (theme === null) {
        window.localStorage.removeItem(LOCAL_STORAGE_KEY);
      } else {
        window.localStorage.setItem(LOCAL_STORAGE_KEY, theme);
      }
    } catch {
      // Theme switching still works when storage is unavailable or denied.
    }
  }

  window.dispatchEvent(
    new CustomEvent<ElmethisTheme | null>(THEME_CHANGE_EVENT, {
      detail: theme,
    }),
  );
};

/** Creates an owner-scoped controller for Elmethis' native color scheme. */
export function createElmethisTheme(): ElmethisThemeController {
  const [isDarkTheme, setIsDarkTheme] = createSignal(false);
  let mediaQuery: MediaQueryList | undefined;

  const resolveDocumentTheme = (
    prefersDark = mediaQuery?.matches ?? false,
  ): boolean => {
    // Hosts such as Storybook can pin a scheme without persisting a choice.
    // Read computed CSS so stylesheet pins (including `only light`) count too.
    const schemes = window
      .getComputedStyle(document.documentElement)
      .colorScheme.split(/\s+/);
    const supportsDark = schemes.includes("dark");
    const supportsLight = schemes.includes("light");
    return supportsDark !== supportsLight ? supportsDark : prefersDark;
  };

  const toggleTheme = (): void => {
    const next: ElmethisTheme = resolveDocumentTheme() ? "light" : "dark";
    setIsDarkTheme(next === "dark");
    applyTheme(next, true);
  };

  onMount(() => {
    if (typeof window.matchMedia === "function") {
      mediaQuery = window.matchMedia(DARK_MEDIA_QUERY);
    }

    const onThemeChange = (event: Event): void => {
      const theme = (event as CustomEvent<ElmethisTheme | null>).detail;
      setIsDarkTheme(
        theme === null ? resolveDocumentTheme() : theme === "dark",
      );
    };
    const onStorage = (event: StorageEvent): void => {
      if (event.key !== null && event.key !== LOCAL_STORAGE_KEY) {
        return;
      }

      // Apply first; the broadcast resolves auto mode after the pin is removed.
      applyTheme(parseTheme(event.newValue), false);
    };
    const onPreferenceChange = (event: MediaQueryListEvent): void => {
      if (readStoredTheme() === null) {
        setIsDarkTheme(resolveDocumentTheme(event.matches));
      }
    };

    window.addEventListener(THEME_CHANGE_EVENT, onThemeChange);
    window.addEventListener("storage", onStorage);
    mediaQuery?.addEventListener("change", onPreferenceChange);

    const storedTheme = readStoredTheme();
    setIsDarkTheme(
      storedTheme === null ? resolveDocumentTheme() : storedTheme === "dark",
    );
    if (storedTheme !== null) {
      applyTheme(storedTheme, false);
    }

    onCleanup(() => {
      window.removeEventListener(THEME_CHANGE_EVENT, onThemeChange);
      window.removeEventListener("storage", onStorage);
      mediaQuery?.removeEventListener("change", onPreferenceChange);
      mediaQuery = undefined;
    });
  });

  return { isDarkTheme, toggleTheme };
}
