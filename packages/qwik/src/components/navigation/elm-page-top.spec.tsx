// @vitest-environment happy-dom

import { describe, expect, test, vi } from "vitest";
import { createDOM } from "@qwik.dev/core/testing";
import { renderToString } from "@qwik.dev/core/server";

import { ElmPageTop } from "./elm-page-top";

// ElmPageTop is a scroll-to-top affordance. The visibility toggle is driven by
// a `useVisibleTask$` scroll listener (document-idle) that createDOM fires
// unreliably, so visibility is left to a browser/Storybook check. What the unit
// layer can pin: the root nav renders, the `position` prop maps to the correct
// inline edge, and a click invokes the smooth `window.scrollTo` wiring.

describe("[CSR] ElmPageTop — render + position", () => {
  test("renders a nav carrying the root class and the 'Back to Top' label", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmPageTop />);

    const nav = screen.querySelector("nav")!;
    expect(nav).toBeTruthy();
    expect(nav.className).toMatch(/elm-page-top/);
    expect(screen.outerHTML).toContain("Back to Top");
  });

  test("position='right' (default) pins the button to the right edge", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmPageTop />);

    const nav = screen.querySelector("nav") as HTMLElement;
    const style = nav.getAttribute("style") ?? "";
    expect(style).toContain("right:0");
    expect(style).toContain("left:auto");
  });

  test("position='left' pins the button to the left edge", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmPageTop position="left" />);

    const nav = screen.querySelector("nav") as HTMLElement;
    const style = nav.getAttribute("style") ?? "";
    expect(style).toContain("left:0");
    expect(style).toContain("right:auto");
  });
});

describe("[CSR] ElmPageTop — interaction", () => {
  test("clicking the button calls window.scrollTo({ top: 0, behavior: 'smooth' })", async () => {
    const scrollTo = vi.fn();
    vi.stubGlobal("scrollTo", scrollTo);

    const { screen, render, userEvent } = await createDOM();
    await render(<ElmPageTop />);

    await userEvent("nav", "click");

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
    vi.unstubAllGlobals();
  });
});

describe("[SSR] ElmPageTop", () => {
  test("server HTML emits the nav with the label", async () => {
    const { html } = await renderToString(<ElmPageTop />, {
      containerTagName: "div",
    });
    expect(html.toLowerCase()).toContain("<nav");
    expect(html).toContain("Back to Top");
  });
});
