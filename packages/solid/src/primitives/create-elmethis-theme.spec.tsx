import { fireEvent, render } from "@solidjs/testing-library";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createElmethisTheme,
  THEME_CHANGE_EVENT,
} from "./create-elmethis-theme";

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

const ThemePair = () => {
  const first = createElmethisTheme();
  const second = createElmethisTheme();
  return (
    <div>
      <output data-testid="first">{String(first.isDarkTheme())}</output>
      <output data-testid="second">{String(second.isDarkTheme())}</output>
      <button type="button" onClick={first.toggleTheme}>
        Toggle
      </button>
    </div>
  );
};

describe("[CSR] createElmethisTheme", () => {
  let matches = false;
  let preferenceListener: ((event: MediaQueryListEvent) => void) | undefined;
  const removePreferenceListener = vi.fn();

  beforeEach(() => {
    matches = false;
    preferenceListener = undefined;
    removePreferenceListener.mockClear();
    localStorage.clear();
    document.documentElement.style.removeProperty("color-scheme");
    document.documentElement.removeAttribute("data-theme");
    vi.spyOn(window, "matchMedia").mockImplementation(
      () =>
        ({
          get matches() {
            return matches;
          },
          media: "(prefers-color-scheme: dark)",
          onchange: null,
          addEventListener: (
            _type: string,
            listener: EventListenerOrEventListenerObject,
          ) => {
            preferenceListener = listener as (
              event: MediaQueryListEvent,
            ) => void;
          },
          removeEventListener: (
            _type: string,
            listener: EventListenerOrEventListenerObject,
          ) => {
            removePreferenceListener(listener);
            if (preferenceListener === listener) preferenceListener = undefined;
          },
          addListener: vi.fn(),
          removeListener: vi.fn(),
          dispatchEvent: vi.fn(),
        }) as MediaQueryList,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    document.documentElement.style.removeProperty("color-scheme");
    document.documentElement.removeAttribute("data-theme");
  });

  it("hydrates from storage on mount and pins the native root theme", () => {
    localStorage.setItem(KEY, "dark");
    const rendered = render(() => <ThemeHarness />);

    expect(rendered.getByTestId("dark")).toHaveTextContent("true");
    expect(document.documentElement.style.colorScheme).toBe("dark");
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
  });

  it("toggles, persists, and broadcasts after applying the root theme", () => {
    const received: string[] = [];
    const rendered = render(() => <ThemeHarness />);
    const listener = (event: Event) => {
      received.push((event as CustomEvent<string>).detail);
      expect(document.documentElement.style.colorScheme).toBe("dark");
    };
    window.addEventListener(THEME_CHANGE_EVENT, listener);

    fireEvent.click(rendered.getByRole("button", { name: "Toggle" }));

    expect(rendered.getByTestId("dark")).toHaveTextContent("true");
    expect(localStorage.getItem(KEY)).toBe("dark");
    expect(received).toEqual(["dark"]);
    window.removeEventListener(THEME_CHANGE_EVENT, listener);
  });

  it("synchronizes independent controllers in the same tab", () => {
    const rendered = render(() => <ThemePair />);

    fireEvent.click(rendered.getByRole("button", { name: "Toggle" }));

    expect(rendered.getByTestId("first")).toHaveTextContent("true");
    expect(rendered.getByTestId("second")).toHaveTextContent("true");
  });

  it("observes cross-tab storage changes and safely parses unknown values", () => {
    const rendered = render(() => <ThemeHarness />);

    window.dispatchEvent(
      new StorageEvent("storage", { key: KEY, newValue: "dark" }),
    );
    expect(rendered.getByTestId("dark")).toHaveTextContent("true");
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");

    window.dispatchEvent(
      new StorageEvent("storage", { key: null, newValue: null }),
    );
    expect(rendered.getByTestId("dark")).toHaveTextContent("false");
    expect(document.documentElement).not.toHaveAttribute("data-theme");

    window.dispatchEvent(
      new StorageEvent("storage", { key: KEY, newValue: "unknown" }),
    );
    expect(rendered.getByTestId("dark")).toHaveTextContent("false");
    expect(document.documentElement).not.toHaveAttribute("data-theme");
    expect(document.documentElement.style.colorScheme).toBe("");
  });

  it("tracks OS preference changes only while no theme is pinned", () => {
    const rendered = render(() => <ThemeHarness />);

    matches = true;
    preferenceListener?.({ matches: true } as MediaQueryListEvent);
    expect(rendered.getByTestId("dark")).toHaveTextContent("true");

    localStorage.setItem(KEY, "light");
    preferenceListener?.({ matches: false } as MediaQueryListEvent);
    expect(rendered.getByTestId("dark")).toHaveTextContent("true");
  });

  it("continues toggling when localStorage access is denied", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("denied", "SecurityError");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("denied", "SecurityError");
    });

    const rendered = render(() => <ThemeHarness />);
    fireEvent.click(rendered.getByRole("button", { name: "Toggle" }));

    expect(rendered.getByTestId("dark")).toHaveTextContent("true");
    expect(document.documentElement.style.colorScheme).toBe("dark");
  });

  it("removes window and media-query listeners on cleanup", () => {
    const removeWindowListener = vi.spyOn(window, "removeEventListener");
    const rendered = render(() => <ThemeHarness />);

    rendered.unmount();

    expect(removeWindowListener).toHaveBeenCalledWith(
      THEME_CHANGE_EVENT,
      expect.any(Function),
    );
    expect(removeWindowListener).toHaveBeenCalledWith(
      "storage",
      expect.any(Function),
    );
    expect(removePreferenceListener).toHaveBeenCalledOnce();
  });
});
