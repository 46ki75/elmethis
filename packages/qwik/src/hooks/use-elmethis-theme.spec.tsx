// @vitest-environment happy-dom

import { component$ } from "@qwik.dev/core";
import { createDOM } from "@qwik.dev/core/testing";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { useElmethisTheme } from "./use-elmethis-theme";

const LOCAL_STORAGE_KEY = "elmethis-theme";

// ---------------------------------------------------------------------------
// Wrapper component
// ---------------------------------------------------------------------------

const ThemeWrapper = component$(() => {
  const { isDarkTheme, toggleTheme } = useElmethisTheme();
  return (
    <div>
      <span id="isDark">{String(isDarkTheme.value)}</span>
      <button id="toggle" onClick$={toggleTheme}>
        Toggle
      </button>
    </div>
  );
});

// ---------------------------------------------------------------------------
// [CSR] toggleTheme()
// ---------------------------------------------------------------------------

describe("[CSR] toggleTheme()", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
    const body = document.querySelector("body");
    if (body) body.style.colorScheme = "";
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("flips isDarkTheme, writes data-theme, and persists to localStorage", async () => {
    const { screen, render, userEvent } = await createDOM();
    await render(<ThemeWrapper />);

    expect(screen.querySelector("#isDark")!.textContent).toBe("false");

    await userEvent("#toggle", "click");

    expect(screen.querySelector("#isDark")!.textContent).toBe("true");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(localStorage.getItem(LOCAL_STORAGE_KEY)).toBe("dark");
  });

  test("toggling twice returns to light", async () => {
    const { screen, render, userEvent } = await createDOM();
    await render(<ThemeWrapper />);

    await userEvent("#toggle", "click");
    await userEvent("#toggle", "click");

    expect(screen.querySelector("#isDark")!.textContent).toBe("false");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(localStorage.getItem(LOCAL_STORAGE_KEY)).toBe("light");
  });
});

// ---------------------------------------------------------------------------
// [CSR] cross-tab storage listener target
// ---------------------------------------------------------------------------
//
// Repro for the original bug: the listener was attached via
// `useOnDocument("storage", ...)`. The `storage` event fires on `window`, not
// `document`, so cross-tab updates were silently dropped.
//
// We can't reliably exercise the listener at runtime in this test environment
// (Qwik's event system requires the qwikloader, which isn't wired up in
// `createDOM`). What we CAN do is inspect the resumable markup that Qwik
// emits: `useOnWindow("evt", ...)` serializes as `q-w:evt=""` on the host
// element, while `useOnDocument("evt", ...)` serializes as `q-d:evt=""`. The
// presence of `q-w:storage` is the structural proof that the listener is
// registered against the right target.

describe("[CSR] storage listener attachment", () => {
  test("storage event is wired to window, not document", async () => {
    const { screen, render } = await createDOM();
    await render(<ThemeWrapper />);

    const markup = screen.outerHTML;
    // Window listener for "storage" must be present (the fix).
    expect(markup).toContain("q-w:storage");
    // And the buggy form — a document listener for "storage" — must not.
    expect(markup).not.toContain("q-d:storage");
  });
});
