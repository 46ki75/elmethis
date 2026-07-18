import { fireEvent, render } from "@solidjs/testing-library";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ElmToggleTheme } from "./elm-toggle-theme";

const resetTheme = () => {
  localStorage.removeItem("elmethis-theme");
  document.documentElement.style.removeProperty("color-scheme");
  document.documentElement.removeAttribute("data-theme");
};

describe("[CSR] ElmToggleTheme", () => {
  beforeEach(resetTheme);
  afterEach(() => {
    vi.restoreAllMocks();
    resetTheme();
  });

  it("forwards SVG props and uses accessible defaults", () => {
    const rendered = render(() => (
      <ElmToggleTheme class="custom-theme" data-testid="theme" />
    ));
    const toggle = rendered.getByRole("button", {
      name: "Switch to dark theme",
    });

    expect(toggle.tagName.toLowerCase()).toBe("svg");
    expect(toggle).toHaveAttribute("width", "2rem");
    expect(toggle).toHaveAttribute("height", "2rem");
    expect(toggle).toHaveAttribute("tabindex", "0");
    expect(toggle).toHaveClass("custom-theme");
    expect(toggle).toHaveAttribute("data-testid", "theme");
  });

  it("scopes SVG references per instance", () => {
    const rendered = render(() => (
      <>
        <ElmToggleTheme />
        <ElmToggleTheme />
      </>
    ));
    const masks = [...rendered.container.querySelectorAll("mask")];
    const maskIds = masks.map((mask) => mask.id);

    expect(new Set(maskIds).size).toBe(2);
    for (const mask of masks) {
      expect(
        rendered.container.querySelector(`[mask="url(#${mask.id})"]`),
      ).toBeTruthy();
    }
  });

  it("toggles by click and keyboard while composing native handlers", () => {
    const onClick = vi.fn();
    const onKeyDown = vi.fn();
    const rendered = render(() => (
      <ElmToggleTheme onClick={onClick} onKeyDown={onKeyDown} />
    ));

    fireEvent.click(
      rendered.getByRole("button", { name: "Switch to dark theme" }),
    );
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(onClick).toHaveBeenCalledOnce();

    fireEvent.keyDown(
      rendered.getByRole("button", { name: "Switch to light theme" }),
      { key: "Enter" },
    );
    expect(document.documentElement).toHaveAttribute("data-theme", "light");
    expect(onKeyDown).toHaveBeenCalledOnce();
  });
});
