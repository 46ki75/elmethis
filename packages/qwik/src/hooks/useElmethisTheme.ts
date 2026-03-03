import { $, useOnDocument, useSignal, useVisibleTask$ } from "@builder.io/qwik";

const LOCAL_STORAGE_KEY = "elmethis-theme";

export function useElmethisTheme() {
  const isDarkTheme = useSignal(false);

  const toggleTheme = $(() => {
    isDarkTheme.value = !isDarkTheme.value;

    if (typeof document !== "undefined") {
      const theme = isDarkTheme.value ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", theme);
      const body = document.querySelector("body");
      if (body != null) {
        body.style.colorScheme = theme;
      }

      if (typeof localStorage !== "undefined") {
        localStorage.setItem(LOCAL_STORAGE_KEY, theme);
      }
    }
  });

  // Handle updates from other tabs
  useOnDocument(
    "storage",
    $(() => {
      const localStorageTheme = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (localStorageTheme != null) {
        isDarkTheme.value = localStorageTheme === "dark";
      }
    }),
  );

  // Initialize on mount
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(
    () => {
      const currentTheme = document.documentElement.getAttribute("data-theme");
      if (currentTheme != null) {
        isDarkTheme.value = currentTheme === "dark";
      } else {
        const localStorageTheme = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (localStorageTheme != null) {
          isDarkTheme.value = localStorageTheme === "dark";
        }
      }
    },
    { strategy: "document-ready" },
  );

  return { isDarkTheme, toggleTheme };
}
