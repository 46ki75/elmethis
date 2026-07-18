import { render } from "@solidjs/testing-library";
import { page } from "vitest/browser";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createElmethisTheme } from "./create-elmethis-theme";

const KEY = "elmethis-theme";

const ThemeHarness = () => {
  const theme = createElmethisTheme();
  return (
    <div>
      <output data-testid="dark">{String(theme.isDarkTheme())}</output>
      <button type="button" onClick={theme.toggleTheme}>
        Toggle
      </button>
    </div>
  );
};

const resetTheme = () => {
  localStorage.removeItem(KEY);
  document.documentElement.style.removeProperty("color-scheme");
  document.documentElement.removeAttribute("data-theme");
};

describe("[Browser] createElmethisTheme", () => {
  beforeEach(resetTheme);
  afterEach(resetTheme);

  it("hydrates a persisted choice and pins Chromium's computed color scheme", async () => {
    localStorage.setItem(KEY, "dark");
    const rendered = render(() => <ThemeHarness />);

    await vi.waitFor(() =>
      expect(rendered.getByTestId("dark")).toHaveTextContent("true"),
    );
    expect(getComputedStyle(document.documentElement).colorScheme).toBe("dark");
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
  });

  it("toggles and observes a native cross-tab storage event", async () => {
    localStorage.setItem(KEY, "light");
    const rendered = render(() => <ThemeHarness />);
    const screen = page.elementLocator(rendered.baseElement);
    await vi.waitFor(() =>
      expect(document.documentElement).toHaveAttribute("data-theme", "light"),
    );

    await screen.getByRole("button", { name: "Toggle" }).click();
    await vi.waitFor(() =>
      expect(getComputedStyle(document.documentElement).colorScheme).toBe(
        "dark",
      ),
    );
    expect(localStorage.getItem(KEY)).toBe("dark");

    window.dispatchEvent(
      new StorageEvent("storage", { key: KEY, newValue: null }),
    );
    await vi.waitFor(() =>
      expect(document.documentElement).not.toHaveAttribute("data-theme"),
    );
    expect(document.documentElement.style.colorScheme).toBe("");
  });
});
