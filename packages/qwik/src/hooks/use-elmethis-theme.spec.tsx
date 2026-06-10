// @vitest-environment happy-dom

import { component$ } from "@qwik.dev/core";
import { createDOM } from "@qwik.dev/core/testing";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import {
  parseTheme,
  THEME_CHANGE_EVENT,
  useElmethisTheme,
} from "./use-elmethis-theme";

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
    document.documentElement.style.removeProperty("color-scheme");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("flips isDarkTheme, pins color-scheme + data-theme, and persists", async () => {
    const { screen, render, userEvent } = await createDOM();
    await render(<ThemeWrapper />);

    expect(screen.querySelector("#isDark")!.textContent).toBe("false");

    await userEvent("#toggle", "click");

    expect(screen.querySelector("#isDark")!.textContent).toBe("true");
    // `color-scheme` drives the native light-dark() resolution...
    expect(document.documentElement.style.colorScheme).toBe("dark");
    // ...and `data-theme` covers the non-color overrides.
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(localStorage.getItem(LOCAL_STORAGE_KEY)).toBe("dark");
  });

  test("toggling twice returns to light", async () => {
    const { screen, render, userEvent } = await createDOM();
    await render(<ThemeWrapper />);

    await userEvent("#toggle", "click");
    await userEvent("#toggle", "click");

    expect(screen.querySelector("#isDark")!.textContent).toBe("false");
    expect(document.documentElement.style.colorScheme).toBe("light");
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

// ---------------------------------------------------------------------------
// [CSR] same-tab theme-change broadcast
// ---------------------------------------------------------------------------
//
// Repro for the same-tab staleness bug: every `useElmethisTheme()` call owns
// an independent signal, and the `storage` event only fires in OTHER tabs —
// so sibling components in the same tab never saw a toggle. The fix is a
// `CustomEvent` broadcast from `applyTheme` that each instance mirrors via
// `useOnWindow`.
//
// As with the storage listener above, the `useOnWindow` mirror itself can't
// be exercised at runtime under `createDOM` (no qwikloader), so coverage is
// split: the dispatch side is observed with a vanilla listener, and the
// listen side is proven structurally via the `q-w:` resumable markup.

describe("[CSR] same-tab theme-change broadcast", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.style.removeProperty("color-scheme");
  });

  test("toggle dispatches the custom event on window with the new theme", async () => {
    const { render, userEvent } = await createDOM();
    await render(<ThemeWrapper />);

    const received: (string | null)[] = [];
    const listener = (e: Event) => {
      received.push((e as CustomEvent<string | null>).detail);
    };
    window.addEventListener(THEME_CHANGE_EVENT, listener);

    try {
      await userEvent("#toggle", "click");
      expect(received).toEqual(["dark"]);

      await userEvent("#toggle", "click");
      expect(received).toEqual(["dark", "light"]);
    } finally {
      window.removeEventListener(THEME_CHANGE_EVENT, listener);
    }
  });

  test("theme-change mirror is wired to window", async () => {
    const { screen, render } = await createDOM();
    await render(<ThemeWrapper />);

    // In the resumable attribute encoding a single "-" marks an uppercase
    // letter, so literal dashes in the event name are serialized doubled;
    // the qwikloader decodes it back to `elmethis-theme-change` on resume.
    const escaped = THEME_CHANGE_EVENT.replaceAll("-", "--");
    expect(screen.outerHTML).toContain(`q-w:${escaped}`);
  });
});

// ---------------------------------------------------------------------------
// parseTheme()
// ---------------------------------------------------------------------------
//
// Regression pin for the storage-coercion rule. The cross-tab storage
// handler and the mount-time reader both route through `parseTheme`. Only
// the literal strings "dark" and "light" are explicit choices; anything
// else — including `null` (key cleared in another tab) and unknown strings —
// resolves to `null`, meaning "follow the OS".
//
// This is the deliberate behavior: a cleared key should release the pin and
// fall back to the native `color-scheme: light dark` default (which tracks
// prefers-color-scheme), not lock in a theme.

describe("parseTheme", () => {
  test('"dark" → "dark"', () => {
    expect(parseTheme("dark")).toBe("dark");
  });

  test('"light" → "light"', () => {
    expect(parseTheme("light")).toBe("light");
  });

  test("null (key cleared in another tab) → null (follow OS)", () => {
    expect(parseTheme(null)).toBeNull();
  });

  test("unknown string → null (follow OS)", () => {
    expect(parseTheme("auto")).toBeNull();
    expect(parseTheme("")).toBeNull();
  });
});
