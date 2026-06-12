import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";

import { ElmList } from "./elm-list";

describe("[CSR] ElmList", () => {
  // `listStyle` selects the list element: "ordered" → <ol>, "unordered" → <ul>.
  it("listStyle='ordered' renders an <ol>", () => {
    const { container } = render(
      <ElmList listStyle="ordered">
        <li>one</li>
      </ElmList>,
    );
    expect(container.querySelector("ol")).not.toBeNull();
    expect(container.querySelector("ul")).toBeNull();
    expect(container).toHaveTextContent("one");
  });

  it("listStyle='unordered' renders a <ul>", () => {
    const { container } = render(
      <ElmList listStyle="unordered">
        <li>item</li>
      </ElmList>,
    );
    expect(container.querySelector("ul")).not.toBeNull();
    expect(container.querySelector("ol")).toBeNull();
    expect(container).toHaveTextContent("item");
  });

  it("renders multiple list items from the children", () => {
    const { container } = render(
      <ElmList listStyle="unordered">
        <li>alpha</li>
        <li>beta</li>
      </ElmList>,
    );
    expect(container).toHaveTextContent("alpha");
    expect(container).toHaveTextContent("beta");
  });

  // Nested lists are just lists in the children — both element types should appear.
  it("supports nested lists", () => {
    const { container } = render(
      <ElmList listStyle="unordered">
        <li>
          parent
          <ElmList listStyle="ordered">
            <li>child</li>
          </ElmList>
        </li>
      </ElmList>,
    );
    expect(container.querySelector("ul")).not.toBeNull();
    expect(container.querySelector("ol")).not.toBeNull();
    expect(container).toHaveTextContent("parent");
    expect(container).toHaveTextContent("child");
  });

  it("ordered list forwards the native `type` attribute", () => {
    const { container } = render(
      <ElmList listStyle="ordered" type="a">
        <li>x</li>
      </ElmList>,
    );
    expect(container.querySelector("ol")).toHaveAttribute("type", "a");
  });
});

describe("[SSR] ElmList", () => {
  it("renders an <ol> server-side", () => {
    const html = renderToStaticMarkup(
      <ElmList listStyle="ordered">
        <li>ssr-item</li>
      </ElmList>,
    ).toLowerCase();
    expect(html).toContain("<ol");
    expect(html).toContain("ssr-item");
  });

  it("renders a <ul> server-side", () => {
    const html = renderToStaticMarkup(
      <ElmList listStyle="unordered">
        <li>ssr-item</li>
      </ElmList>,
    ).toLowerCase();
    expect(html).toContain("<ul");
  });
});
