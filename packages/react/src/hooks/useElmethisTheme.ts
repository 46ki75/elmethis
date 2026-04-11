import { useCallback, useEffect, useState } from "react";

const LOCAL_STORAGE_KEY = "elmethis-theme";

function readInitialTheme(): boolean {
  if (typeof document !== "undefined") {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    if (currentTheme != null) {
      return currentTheme === "dark";
    }
  }
  if (typeof localStorage !== "undefined") {
    const localStorageTheme = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (localStorageTheme != null) {
      return localStorageTheme === "dark";
    }
  }
  return false;
}

export function useElmethisTheme() {
  const [isDarkTheme, setIsDarkTheme] = useState(readInitialTheme);

  const toggleTheme = useCallback(() => {
    setIsDarkTheme((prev) => !prev);
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute(
        "data-theme",
        isDarkTheme ? "dark" : "light",
      );
      const body = document.querySelector("body");
      if (body != null) {
        body.style.colorScheme = isDarkTheme ? "dark" : "light";
      }

      if (typeof localStorage !== "undefined") {
        localStorage.setItem(
          LOCAL_STORAGE_KEY,
          isDarkTheme ? "dark" : "light",
        );
      }
    }
  }, [isDarkTheme]);

  return { isDarkTheme, toggleTheme };
}
