import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";

import { ElmRectangleWave } from "./elm-rectangle-wave";

// ElmRectangleWave is the shimmer placeholder: a single presentational `<div>`
// that is `aria-hidden` and forwards native `<div>` attributes. No state, no
// effects — a pure CSR + SSR render check is enough.

describe("[CSR] ElmRectangleWave", () => {
  it("renders an aria-hidden div carrying the root class", () => {
    const { container } = render(<ElmRectangleWave />);

    const wave = container.querySelector("div")!;
    expect(wave).toBeTruthy();
    expect(wave.getAttribute("aria-hidden")).toBe("true");
    expect(wave.className).toMatch(/elm-rectangle-wave/);
  });

  it("forwards native div attributes (class merge + style)", () => {
    const { container } = render(
      <ElmRectangleWave className="extra" style={{ width: "10rem" }} />,
    );

    const wave = container.querySelector("div")!;
    // The authored root class survives alongside the consumer-supplied one.
    expect(wave.className).toMatch(/elm-rectangle-wave/);
    expect(wave.className).toContain("extra");
    expect(wave.getAttribute("style")).toContain("width: 10rem");
  });
});

describe("[SSR] ElmRectangleWave", () => {
  it("server HTML emits the aria-hidden placeholder div", () => {
    const html = renderToStaticMarkup(<ElmRectangleWave />).toLowerCase();
    expect(html).toContain("<div");
    expect(html).toContain('aria-hidden="true"');
  });
});
