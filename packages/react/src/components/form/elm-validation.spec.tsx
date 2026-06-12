import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";

import { ElmValidation } from "./elm-validation";

describe("[CSR] ElmValidation", () => {
  it("renders the validation text and an icon", () => {
    const { container } = render(
      <ElmValidation text="Must be 8+ chars" isValid={false} />,
    );
    expect(container).toHaveTextContent("Must be 8+ chars");
    // ElmMdiIcon renders as an <svg>.
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("invalid state dims the row via the scoped opacity variable", () => {
    const { container } = render(
      <ElmValidation text="Pending" isValid={false} />,
    );
    const root = container.querySelector("div")!;
    expect(root.style.getPropertyValue("--elmethis-scoped-opacity")).toBe(
      "0.5",
    );
  });

  it("valid state renders at full opacity", () => {
    const { container } = render(<ElmValidation text="Looks good" isValid />);
    const root = container.querySelector("div")!;
    expect(root.style.getPropertyValue("--elmethis-scoped-opacity")).toBe("1");
  });

  it("merges a passthrough className onto the root", () => {
    const { container } = render(
      <ElmValidation text="x" isValid className="custom-class" />,
    );
    expect(container.querySelector("div")).toHaveClass("custom-class");
  });
});

describe("[SSR] ElmValidation", () => {
  it("renders the text in the server shell", () => {
    const html = renderToStaticMarkup(
      <ElmValidation text="Server-checked" isValid />,
    );
    expect(html).toContain("Server-checked");
  });
});
