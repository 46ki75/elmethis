import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";

import { ElmMdiIcon } from "./elm-mdi-icon";
import { mdiCodeTags } from "@mdi/js";

describe("[CSR] ElmMdiIcon", () => {
  it("renders a decorative currentColor SVG with the given path", () => {
    const { container } = render(<ElmMdiIcon path={mdiCodeTags} />);
    const svg = container.querySelector("svg")!;
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).not.toHaveAttribute("role");
    expect(svg).toHaveAttribute("focusable", "false");
    expect(svg).toHaveAttribute("fill", "currentColor");
    expect(container.querySelector("path")).toHaveAttribute("d", mdiCodeTags);
  });

  it("exposes a labeled icon as an image", () => {
    const { container, getByRole } = render(
      <ElmMdiIcon path={mdiCodeTags} label="Code" />,
    );
    const svg = getByRole("img", { name: "Code" });
    expect(svg).not.toHaveAttribute("aria-hidden");
    expect(container.querySelector("title")).toHaveTextContent("Code");
  });

  it("size prop drives both width and height", () => {
    const { container } = render(<ElmMdiIcon path={mdiCodeTags} size={32} />);
    const svg = container.querySelector("svg")!;
    expect(svg).toHaveAttribute("width", "32");
    expect(svg).toHaveAttribute("height", "32");
  });

  it("color prop sets the currentColor source", () => {
    const { container } = render(
      <ElmMdiIcon path={mdiCodeTags} color="var(--elmethis-color-primary)" />,
    );
    const svg = container.querySelector("svg")!;
    expect(svg).toHaveAttribute("color", "var(--elmethis-color-primary)");
    expect(svg).toHaveAttribute("fill", "currentColor");
  });

  it("uses native ARIA naming when provided", () => {
    const { getByRole } = render(
      <ElmMdiIcon path={mdiCodeTags} aria-label="Code" />,
    );
    expect(getByRole("img", { name: "Code" })).not.toHaveAttribute(
      "aria-hidden",
    );
  });

  it("merges a passthrough className onto the root", () => {
    const { container } = render(
      <ElmMdiIcon path={mdiCodeTags} className="custom-class" />,
    );
    expect(container.querySelector("svg")).toHaveClass("custom-class");
  });
});

describe("[SSR] ElmMdiIcon", () => {
  it("renders the labeled svg shell with the path", () => {
    const html = renderToStaticMarkup(
      <ElmMdiIcon path={mdiCodeTags} label="Code" />,
    ).toLowerCase();
    expect(html).toContain("<svg");
    expect(html).toContain('role="img"');
    expect(html).toContain("<title>code</title>");
    expect(html).toContain(`d="${mdiCodeTags.toLowerCase()}"`);
  });
});
