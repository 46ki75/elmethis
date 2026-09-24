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

  it("changes the background on the first click when the host overrides the OS theme", async () => {
    localStorage.removeItem("elmethis-theme");
    const hostTheme = matchMedia("(prefers-color-scheme: dark)").matches
      ? "light"
      : "dark";
    const nextTheme = hostTheme === "dark" ? "light" : "dark";
    document.documentElement.style.colorScheme = hostTheme;

    const rendered = render(() => (
      <>
        <div
          data-testid="surface"
          style={{ "background-color": "var(--elmethis-color-surface-base)" }}
        >
          <ElmToggleTheme />
        </div>
        <div
          data-testid="reference"
          style={{
            "background-color": "var(--elmethis-color-surface-base)",
            "color-scheme": nextTheme,
          }}
        />
      </>
    ));
    const screen = page.elementLocator(rendered.baseElement);
    const background = () =>
      getComputedStyle(rendered.getByTestId("surface")).backgroundColor;
    const initialBackground = background();
    const nextBackground = getComputedStyle(
      rendered.getByTestId("reference"),
    ).backgroundColor;
    expect(initialBackground).not.toBe(nextBackground);

    await screen.getByRole("button").click();

    await vi.waitFor(() => expect(background()).toBe(nextBackground));
    expect(document.documentElement.style.colorScheme).toBe(nextTheme);
    expect(localStorage.getItem("elmethis-theme")).toBe(nextTheme);
    expect(rendered.getByRole("button")).toHaveAttribute(
      "aria-label",
      `Switch to ${hostTheme} theme`,
    );

    await screen.getByRole("button").click();

    await vi.waitFor(() => expect(background()).toBe(initialBackground));
  });

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
