import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createSSRApp, defineComponent, h, nextTick } from "vue";
import { renderToString } from "vue/server-renderer";

import {
  parseTheme,
  THEME_CHANGE_EVENT,
  useElmethisTheme,
} from "./use-elmethis-theme";

const LOCAL_STORAGE_KEY = "elmethis-theme";

// `useElmethisTheme` mutates the shared `<html>` element and localStorage; reset
// both around every test so cases can't bleed into one another.
const resetRoot = () => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
  document.documentElement.style.removeProperty("color-scheme");
};

const root = () => document.documentElement;

// Single-instance harness: a button bound to `toggleTheme` and a span echoing
// the live `isDarkTheme`.
const ThemeProbe = defineComponent({
  name: "ThemeProbe",
  setup() {
    const { isDarkTheme, toggleTheme } = useElmethisTheme();
    return () => (
      <div>
        <span class="is-dark">{String(isDarkTheme.value)}</span>
        <button onClick={toggleTheme}>Toggle</button>
      </div>
    );
  },
});

// Two independent instances in one tab — exercises the same-tab CustomEvent
// broadcast: toggling A must mirror into B.
const PairProbe = defineComponent({
  name: "PairProbe",
  setup() {
    const a = useElmethisTheme();
    const b = useElmethisTheme();
    return () => (
      <div>
        <span class="a">{String(a.isDarkTheme.value)}</span>
        <span class="b">{String(b.isDarkTheme.value)}</span>
        <button onClick={a.toggleTheme}>Toggle A</button>
      </div>
    );
  },
});

describe("parseTheme", () => {
  it("maps explicit choices and treats everything else as auto (null)", () => {
    expect(parseTheme("dark")).toBe("dark");
    expect(parseTheme("light")).toBe("light");
    expect(parseTheme(null)).toBeNull();
    expect(parseTheme("")).toBeNull();
    expect(parseTheme("system")).toBeNull();
  });
});

describe("[CSR] useElmethisTheme — toggleTheme()", () => {
  beforeEach(resetRoot);
  afterEach(resetRoot);

  it("flips isDarkTheme, pins color-scheme + data-theme, and persists", async () => {
    const wrapper = mount(ThemeProbe);
    expect(wrapper.find(".is-dark").text()).toBe("false");

    await wrapper.find("button").trigger("click");

    expect(wrapper.find(".is-dark").text()).toBe("true");
    expect(root().style.colorScheme).toBe("dark");
    expect(root().getAttribute("data-theme")).toBe("dark");
    expect(localStorage.getItem(LOCAL_STORAGE_KEY)).toBe("dark");
  });

  it("toggling twice returns to light", async () => {
    const wrapper = mount(ThemeProbe);

    await wrapper.find("button").trigger("click");
    await wrapper.find("button").trigger("click");

    expect(wrapper.find(".is-dark").text()).toBe("false");
    expect(root().style.colorScheme).toBe("light");
    expect(root().getAttribute("data-theme")).toBe("light");
    expect(localStorage.getItem(LOCAL_STORAGE_KEY)).toBe("light");
  });

  it("seeds isDarkTheme from a persisted choice", () => {
    localStorage.setItem(LOCAL_STORAGE_KEY, "dark");
    const wrapper = mount(ThemeProbe);
    // The ref initializer reads storage synchronously during setup.
    expect(wrapper.find(".is-dark").text()).toBe("true");
  });
});

describe("[CSR] useElmethisTheme — host-provided color scheme", () => {
  beforeEach(resetRoot);
  afterEach(() => {
    vi.restoreAllMocks();
    resetRoot();
  });

  it.each(["light", "dark"] as const)(
    "resolves a host-pinned %s theme instead of the opposite OS preference",
    async (theme) => {
      const preference = window.matchMedia("(prefers-color-scheme: dark)");
      vi.spyOn(preference, "matches", "get").mockReturnValue(theme === "light");
      vi.spyOn(window, "matchMedia").mockReturnValue(preference);
      root().style.colorScheme = theme;
      const wrapper = mount(ThemeProbe);

      expect(wrapper.find(".is-dark").text()).toBe(String(theme === "dark"));
      expect(localStorage.getItem(LOCAL_STORAGE_KEY)).toBeNull();

      preference.dispatchEvent(
        new MediaQueryListEvent("change", { matches: theme === "light" }),
      );
      await nextTick();
      expect(wrapper.find(".is-dark").text()).toBe(String(theme === "dark"));

      await wrapper.find("button").trigger("click");

      const nextTheme = theme === "dark" ? "light" : "dark";
      expect(root().style.colorScheme).toBe(nextTheme);
      expect(localStorage.getItem(LOCAL_STORAGE_KEY)).toBe(nextTheme);
    },
  );

  it("toggles the current document theme if the host changes it after mount", async () => {
    const wrapper = mount(ThemeProbe);
    root().style.colorScheme = "dark";

    await wrapper.find("button").trigger("click");

    expect(wrapper.find(".is-dark").text()).toBe("false");
    expect(root().style.colorScheme).toBe("light");
    expect(localStorage.getItem(LOCAL_STORAGE_KEY)).toBe("light");
  });
});

describe("[CSR] useElmethisTheme — same-tab broadcast", () => {
  beforeEach(resetRoot);
  afterEach(resetRoot);

  it("toggling one instance mirrors into a sibling instance", async () => {
    const wrapper = mount(PairProbe);
    expect(wrapper.find(".a").text()).toBe("false");
    expect(wrapper.find(".b").text()).toBe("false");

    await wrapper.find("button").trigger("click");

    // The CustomEvent broadcast on window reaches both instances' listeners.
    expect(wrapper.find(".a").text()).toBe("true");
    expect(wrapper.find(".b").text()).toBe("true");
  });
});

describe("[SSR] useElmethisTheme", () => {
  it("renders without touching the DOM (mount effects don't run server-side)", async () => {
    const html = await renderToString(
      createSSRApp({ render: () => h(ThemeProbe) }),
    );
    // Server seed is the safe default; THEME_CHANGE_EVENT is unused on the
    // server but importing it must not throw.
    expect(THEME_CHANGE_EVENT).toBe("elmethis-theme-change");
    expect(html).toContain("false");
  });
});
