import { describe, expect, test } from "vitest";
import { createDOM } from "@qwik.dev/core/testing";
import { renderToString } from "@qwik.dev/core/server";

import { ElmRectangleWave } from "./elm-rectangle-wave";

// ElmRectangleWave is the shimmer placeholder: a single presentational `<div>`
// that is `aria-hidden` and forwards native `<div>` attributes. No state, no
// effects — a pure CSR + SSR render check is enough.

describe("[CSR] ElmRectangleWave", () => {
  test("renders an aria-hidden div carrying the root class", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmRectangleWave />);

    const wave = screen.querySelector("div")!;
    expect(wave).toBeTruthy();
    expect(wave.getAttribute("aria-hidden")).toBe("true");
    expect(wave.className).toMatch(/elm-rectangle-wave/);
  });

  test("forwards native div attributes (class merge + style)", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmRectangleWave class="extra" style={{ width: "10rem" }} />);

    const wave = screen.querySelector("div")!;
    // The authored root class survives alongside the consumer-supplied one.
    expect(wave.className).toMatch(/elm-rectangle-wave/);
    expect(wave.className).toContain("extra");
    expect(wave.getAttribute("style")).toContain("width:10rem");
  });
});

describe("[SSR] ElmRectangleWave", () => {
  test("server HTML emits the aria-hidden placeholder div", async () => {
    const { html } = await renderToString(<ElmRectangleWave />, {
      containerTagName: "div",
    });
    expect(html.toLowerCase()).toContain("<div");
    expect(html).toContain('aria-hidden="true"');
  });
});
