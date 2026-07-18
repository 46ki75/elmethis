import { render } from "@solidjs/testing-library";
import { page } from "vitest/browser";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ElmToggleTheme } from "./elm-toggle-theme";

const resetTheme = () => {
  localStorage.removeItem("elmethis-theme");
  document.documentElement.style.removeProperty("color-scheme");
  document.documentElement.removeAttribute("data-theme");
};

describe("[Browser] ElmToggleTheme", () => {
  beforeEach(() => {
    resetTheme();
    localStorage.setItem("elmethis-theme", "light");
  });
  afterEach(resetTheme);

  it("synchronizes multiple controls and keeps dark SVG ids unique", async () => {
    const rendered = render(() => (
      <>
        <ElmToggleTheme />
        <ElmToggleTheme />
      </>
    ));
    const screen = page.elementLocator(rendered.baseElement);

    await screen
      .getByRole("button", { name: "Switch to dark theme" })
      .first()
      .click();

    await vi.waitFor(() =>
      expect(document.documentElement).toHaveAttribute("data-theme", "dark"),
    );
    await vi.waitFor(() =>
      expect(
        rendered.getAllByRole("button", { name: "Switch to light theme" }),
      ).toHaveLength(2),
    );

    const masks = [...rendered.container.querySelectorAll("mask")];
    const animationIds = [
      ...rendered.container.querySelectorAll("animate[id]"),
    ].map((element) => element.id);
    expect(new Set(masks.map((mask) => mask.id)).size).toBe(2);
    expect(new Set(animationIds).size).toBe(2);
  });
});
