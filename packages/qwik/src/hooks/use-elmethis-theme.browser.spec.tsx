import { component$ } from "@qwik.dev/core";
import { render } from "vitest-browser-qwik";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { useElmethisTheme } from "./use-elmethis-theme";

// What this layer adds over `use-elmethis-theme.spec.tsx` (createDOM): the
// things that only a real browser resolves — the *computed* `color-scheme` on
// `<html>`, the `document-ready` visible-task that pins a persisted choice, and
// a cross-tab `StorageEvent` actually reaching the hydrated `useOnWindow`
// listener (the createDOM spec notes it cannot dispatch one through Qwik's
// resumable listeners). See [[project_native_light_dark_theming]] and
// [[project_qwik_browser_testing]].

const KEY = "elmethis-theme";

const Wrapper = component$(() => {
  const { isDarkTheme, toggleTheme } = useElmethisTheme();
  return (
    <div>
      <output data-testid="isDark">{String(isDarkTheme.value)}</output>
      <button data-testid="toggle" onClick$={toggleTheme}>
        Toggle
      </button>
    </div>
  );
});

// The hook mutates the shared `<html>` element and localStorage; reset both
// around every test so cases don't bleed into one another.
const resetRoot = () => {
  const root = document.documentElement;
  root.style.removeProperty("color-scheme");
  root.removeAttribute("data-theme");
  localStorage.removeItem(KEY);
};

const root = () => document.documentElement;
const text = (screen: Awaited<ReturnType<typeof render>>, id: string) =>
  screen.getByTestId(id).element().textContent;

describe("[CSR] useElmethisTheme — native color-scheme", () => {
  beforeEach(resetRoot);
  afterEach(resetRoot);

  test("toggle pins the computed color-scheme + data-theme on <html>", async () => {
    // Seed a persisted "light" so the mount visible-task has a definite,
    // observable settling point (data-theme="light") to wait on before we
    // toggle — otherwise a late-firing mount task could clobber the click.
    localStorage.setItem(KEY, "light");
    const screen = await render(<Wrapper />);
    await vi.waitFor(() =>
      expect(root().getAttribute("data-theme")).toBe("light"),
    );

    await screen.getByTestId("toggle").click();

    await vi.waitFor(() => expect(text(screen, "isDark")).toBe("true"));
    // The real computed value — not just an inline string createDOM can echo.
    expect(getComputedStyle(root()).colorScheme).toBe("dark");
    expect(root().getAttribute("data-theme")).toBe("dark");
    expect(localStorage.getItem(KEY)).toBe("dark");
  });

  test("a persisted choice is pinned by the document-ready visible task", async () => {
    localStorage.setItem(KEY, "dark");
    const screen = await render(<Wrapper />);

    // No interaction: the mount task alone must read storage and pin dark.
    await vi.waitFor(() => expect(text(screen, "isDark")).toBe("true"));
    expect(getComputedStyle(root()).colorScheme).toBe("dark");
    expect(root().getAttribute("data-theme")).toBe("dark");
  });

  test("a cross-tab storage event updates the live signal and the DOM", async () => {
    const screen = await render(<Wrapper />);
    await vi.waitFor(() => expect(text(screen, "isDark")).toBe("false"));

    // Another tab pinned dark. A real StorageEvent on window must reach the
    // hydrated useOnWindow listener and mirror into this tab.
    window.dispatchEvent(
      new StorageEvent("storage", { key: KEY, newValue: "dark" }),
    );

    await vi.waitFor(() => expect(text(screen, "isDark")).toBe("true"));
    expect(root().getAttribute("data-theme")).toBe("dark");
    expect(getComputedStyle(root()).colorScheme).toBe("dark");
  });

  test("a cleared key in another tab reverts to OS auto (unpins color-scheme)", async () => {
    localStorage.setItem(KEY, "dark");
    const screen = await render(<Wrapper />);
    await vi.waitFor(() => expect(text(screen, "isDark")).toBe("true"));

    // Other tab cleared the choice: newValue null -> revert to the OS default,
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
