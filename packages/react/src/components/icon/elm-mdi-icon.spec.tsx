import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";

import { ElmMdiIcon } from "./elm-mdi-icon";
import { mdiCodeTags } from "@mdi/js";

describe("[CSR] ElmMdiIcon", () => {
  it("renders an <svg role='img'> with the given path", () => {
    const { container } = render(<ElmMdiIcon d={mdiCodeTags} />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute("role", "img");
    // The `d` prop must reach the inner <path>.
    expect(container.querySelector("path")).toHaveAttribute("d", mdiCodeTags);
  });

  it("size prop drives both width and height", () => {
    const { container } = render(<ElmMdiIcon d={mdiCodeTags} size="32px" />);
    const svg = container.querySelector("svg")!;
    expect(svg).toHaveAttribute("width", "32px");
    expect(svg).toHaveAttribute("height", "32px");
  });

  it("color prop feeds the svg fill and the scoped light color var", () => {
    const { container } = render(
      <ElmMdiIcon d={mdiCodeTags} color="#ff0000" />,
    );
    const svg = container.querySelector("svg")!;
    expect(svg).toHaveAttribute("fill", "#ff0000");
    // Both --elmethis-scoped-color and --dark-color fall back to `color`.
    expect(svg.style.getPropertyValue("--elmethis-scoped-color")).toBe(
      "#ff0000",
    );
    expect(svg.style.getPropertyValue("--dark-color")).toBe("#ff0000");
  });

  it("lightColor / darkColor override the scoped color vars independently", () => {
    const { container } = render(
      <ElmMdiIcon d={mdiCodeTags} lightColor="#111" darkColor="#eee" />,
    );
    const svg = container.querySelector("svg")!;
    expect(svg.style.getPropertyValue("--elmethis-scoped-color")).toBe("#111");
    expect(svg.style.getPropertyValue("--dark-color")).toBe("#eee");
  });

  it("merges a passthrough className onto the root", () => {
    const { container } = render(
      <ElmMdiIcon d={mdiCodeTags} className="custom-class" />,
    );
    expect(container.querySelector("svg")).toHaveClass("custom-class");
  });
});

describe("[SSR] ElmMdiIcon", () => {
  it("renders the svg shell with the path", () => {
    const html = renderToStaticMarkup(
      <ElmMdiIcon d={mdiCodeTags} />,
    ).toLowerCase();
    expect(html).toContain("<svg");
    expect(html).toContain('role="img"');
    expect(html).toContain(`d="${mdiCodeTags.toLowerCase()}"`);
  });
});
