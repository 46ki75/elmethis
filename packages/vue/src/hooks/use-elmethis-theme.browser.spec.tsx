import { render } from "vitest-browser-vue";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { defineComponent } from "vue";

import { useElmethisTheme } from "./use-elmethis-theme";

// What this layer adds over the happy-dom spec: the things only a real browser
// resolves — the *computed* `color-scheme` on `<html>`, the mount effect that
// pins a persisted choice, and a cross-tab `StorageEvent` actually reaching the
// window listener. See [[project_native_light_dark_theming]].

const KEY = "elmethis-theme";

const Probe = defineComponent({
  name: "Probe",
  setup() {
    const { isDarkTheme, toggleTheme } = useElmethisTheme();
    return () => (
      <div>
        <output data-testid="isDark">{String(isDarkTheme.value)}</output>
        <button data-testid="toggle" onClick={toggleTheme}>
          Toggle
        </button>
      </div>
    );
  },
});

const root = () => document.documentElement;
const resetRoot = () => {
  root().style.removeProperty("color-scheme");
  root().removeAttribute("data-theme");
  localStorage.removeItem(KEY);
};

describe("[browser] useElmethisTheme — native color-scheme", () => {
  beforeEach(resetRoot);
  afterEach(resetRoot);

  test("toggle pins the computed color-scheme + data-theme on <html>", async () => {
    // Seed "light" so the mount effect has a definite settling point to wait on
    // before toggling — otherwise a late mount effect could clobber the click.
    localStorage.setItem(KEY, "light");
    const screen = render(Probe);
    await vi.waitFor(() =>
      expect(root().getAttribute("data-theme")).toBe("light"),
    );

    await screen.getByTestId("toggle").click();

    await vi.waitFor(() =>
      expect(screen.getByTestId("isDark").element().textContent).toBe("true"),
    );
    // The real computed value — not just an inline string happy-dom can echo.
    expect(getComputedStyle(root()).colorScheme).toBe("dark");
    expect(root().getAttribute("data-theme")).toBe("dark");
    expect(localStorage.getItem(KEY)).toBe("dark");
  });

  test("a persisted choice is pinned by the mount effect", async () => {
    localStorage.setItem(KEY, "dark");
    const screen = render(Probe);

    // No interaction: the mount effect alone must read storage and pin dark.
    await vi.waitFor(() =>
      expect(screen.getByTestId("isDark").element().textContent).toBe("true"),
    );
    expect(getComputedStyle(root()).colorScheme).toBe("dark");
    expect(root().getAttribute("data-theme")).toBe("dark");
  });

  test("a cross-tab storage event updates the live state and the DOM", async () => {
    const screen = render(Probe);
    await vi.waitFor(() =>
      expect(screen.getByTestId("isDark").element().textContent).toBe("false"),
    );

    // Another tab pinned dark. A real StorageEvent on window must reach the
    // listener and mirror into this tab.
    window.dispatchEvent(
      new StorageEvent("storage", { key: KEY, newValue: "dark" }),
    );

    await vi.waitFor(() =>
      expect(screen.getByTestId("isDark").element().textContent).toBe("true"),
    );
    expect(root().getAttribute("data-theme")).toBe("dark");
    expect(getComputedStyle(root()).colorScheme).toBe("dark");
  });

  test("a cleared key in another tab reverts to OS auto (unpins color-scheme)", async () => {
    localStorage.setItem(KEY, "dark");
    const screen = render(Probe);
    await vi.waitFor(() =>
      expect(screen.getByTestId("isDark").element().textContent).toBe("true"),
    );

    // Other tab cleared the choice: newValue null -> revert to OS default,
    // which removes the explicit color-scheme pin from <html>.
    window.dispatchEvent(
      new StorageEvent("storage", { key: KEY, newValue: null }),
    );

    await vi.waitFor(() =>
      expect(root().hasAttribute("data-theme")).toBe(false),
    );
    expect(root().style.colorScheme).toBe("");
  });
});
