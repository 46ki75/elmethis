import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";

import { ElmDivider } from "./elm-divider";

describe("[CSR] ElmDivider", () => {
  it("renders an <hr>", () => {
    const { container } = render(<ElmDivider />);
    expect(container.querySelector("hr")).not.toBeNull();
  });

  it("merges a passthrough className onto the root", () => {
    const { container } = render(<ElmDivider className="custom-divider" />);
    expect(container.querySelector("hr")).toHaveClass("custom-divider");
  });
});

describe("[SSR] ElmDivider", () => {
  it("renders an <hr> server-side", () => {
    const html = renderToStaticMarkup(<ElmDivider />).toLowerCase();
    expect(html).toContain("<hr");
  });
});
