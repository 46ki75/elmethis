// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { render, fireEvent, act } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";

import {
  parseTheme,
  THEME_CHANGE_EVENT,
  useElmethisTheme,
} from "./use-elmethis-theme";

const LOCAL_STORAGE_KEY = "elmethis-theme";

// ---------------------------------------------------------------------------
// Wrapper components used by tests
// ---------------------------------------------------------------------------

const ThemeWrapper = () => {
  const { isDarkTheme, toggleTheme } = useElmethisTheme();
  return (
    <div>
      <span id="isDark">{String(isDarkTheme)}</span>
      <button id="toggle" onClick={toggleTheme}>
        Toggle
      </button>
    </div>
  );
};

const PairWrapper = () => {
  const a = useElmethisTheme();
  const b = useElmethisTheme();
  return (
    <div>
      <span id="a">{String(a.isDarkTheme)}</span>
      <span id="b">{String(b.isDarkTheme)}</span>
      <button id="toggle-a" onClick={a.toggleTheme}>
        Toggle A
      </button>
    </div>
  );
};

const resetRoot = () => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
  document.documentElement.style.removeProperty("color-scheme");
};

// ---------------------------------------------------------------------------
// [CSR] toggleTheme()
// ---------------------------------------------------------------------------

describe("[CSR] toggleTheme()", () => {
  beforeEach(resetRoot);
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("flips isDarkTheme, pins color-scheme + data-theme, and persists", () => {
    const { container } = render(<ThemeWrapper />);

    expect(container.querySelector("#isDark")!.textContent).toBe("false");

    fireEvent.click(container.querySelector("#toggle")!);

    expect(container.querySelector("#isDark")!.textContent).toBe("true");
    // `color-scheme` drives the native light-dark() resolution...
    expect(document.documentElement.style.colorScheme).toBe("dark");
    // ...and `data-theme` covers the non-color overrides.
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(localStorage.getItem(LOCAL_STORAGE_KEY)).toBe("dark");
  });

  test("toggling twice returns to light", () => {
    const { container } = render(<ThemeWrapper />);

    fireEvent.click(container.querySelector("#toggle")!);
    fireEvent.click(container.querySelector("#toggle")!);

    expect(container.querySelector("#isDark")!.textContent).toBe("false");
    expect(document.documentElement.style.colorScheme).toBe("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(localStorage.getItem(LOCAL_STORAGE_KEY)).toBe("light");
  });
});

// ---------------------------------------------------------------------------
// [CSR] same-tab theme-change broadcast
// ---------------------------------------------------------------------------
//
// Repro for the same-tab staleness bug: every `useElmethisTheme()` call owns
// independent state, and the `storage` event only fires in OTHER tabs — so
// sibling components in the same tab never saw a toggle. The fix is a
// `CustomEvent` broadcast from `applyTheme` that each instance mirrors via a
// `window` listener.

describe("[CSR] same-tab theme-change broadcast", () => {
  beforeEach(resetRoot);

  test("toggle dispatches the custom event on window with the new theme", () => {
    const { container } = render(<ThemeWrapper />);

    const received: (string | null)[] = [];
    const listener = (e: Event) => {
      received.push((e as CustomEvent<string | null>).detail);
    };
    window.addEventListener(THEME_CHANGE_EVENT, listener);

    try {
      fireEvent.click(container.querySelector("#toggle")!);
      expect(received).toEqual(["dark"]);

      fireEvent.click(container.querySelector("#toggle")!);
      expect(received).toEqual(["dark", "light"]);
    } finally {
      window.removeEventListener(THEME_CHANGE_EVENT, listener);
    }
  });

  test("a sibling instance in the same tab mirrors the toggle", () => {
    const { container } = render(<PairWrapper />);

    expect(container.querySelector("#a")!.textContent).toBe("false");
    expect(container.querySelector("#b")!.textContent).toBe("false");

    fireEvent.click(container.querySelector("#toggle-a")!);

    // The broadcast reaches the sibling instance's window listener.
    expect(container.querySelector("#a")!.textContent).toBe("true");
    expect(container.querySelector("#b")!.textContent).toBe("true");
  });
});

// ---------------------------------------------------------------------------
// [CSR] cross-tab storage listener
// ---------------------------------------------------------------------------
//
// The listener attaches to `window` (not `document`) — the `storage` event
// fires on `window`. Dispatching a real `StorageEvent` must mirror into the
// live state and the DOM.

describe("[CSR] cross-tab storage listener", () => {
  beforeEach(resetRoot);

  test("a cross-tab storage event updates the live state and the DOM", () => {
    const { container } = render(<ThemeWrapper />);

    expect(container.querySelector("#isDark")!.textContent).toBe("false");

    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: LOCAL_STORAGE_KEY,
          newValue: "dark",
        }),
      );
    });

    expect(container.querySelector("#isDark")!.textContent).toBe("true");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(document.documentElement.style.colorScheme).toBe("dark");
  });

  test("a cleared key reverts to OS auto (unpins color-scheme)", () => {
    localStorage.setItem(LOCAL_STORAGE_KEY, "dark");
    const { container } = render(<ThemeWrapper />);

    // The mount effect pins the persisted choice.
    expect(container.querySelector("#isDark")!.textContent).toBe("true");

    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: LOCAL_STORAGE_KEY,
          newValue: null,
        }),
      );
    });

    expect(document.documentElement.hasAttribute("data-theme")).toBe(false);
    expect(document.documentElement.style.colorScheme).toBe("");
  });

  test("ignores storage events for unrelated keys", () => {
    const { container } = render(<ThemeWrapper />);

    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", { key: "other-key", newValue: "dark" }),
      );
    });

    expect(container.querySelector("#isDark")!.textContent).toBe("false");
  });
});

// ---------------------------------------------------------------------------
// [SSR]
// ---------------------------------------------------------------------------
//
// The hook's effects are client-only; SSR must render the wrapper without
// touching `document`/`localStorage`. Initial state is `false` (light).

describe("[SSR]", () => {
  test("renders without invoking client-only effects", () => {
    const html = renderToStaticMarkup(<ThemeWrapper />);
    expect(html).toMatch(/<span id="isDark">false<\/span>/);
  });
});

// ---------------------------------------------------------------------------
// parseTheme()
// ---------------------------------------------------------------------------
//
// Regression pin for the storage-coercion rule. The cross-tab storage handler
// and the mount-time reader both route through `parseTheme`. Only the literal
// strings "dark" and "light" are explicit choices; anything else — including
// `null` (key cleared in another tab) and unknown strings — resolves to
// `null`, meaning "follow the OS".

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
