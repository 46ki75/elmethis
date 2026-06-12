import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import { ElmSelect } from "./elm-select";

describe("[SSR] ElmSelect", () => {
  it("renders the label and placeholder when nothing is selected", () => {
    const html = renderToStaticMarkup(
      <ElmSelect
        label="Pick a model"
        placeholder="Choose one"
        options={[
          { id: "a", label: "Apple" },
          { id: "b", label: "Banana" },
        ]}
      />,
    );
    expect(html).toContain("Pick a model");
    expect(html).toContain("Choose one");
  });

  it("renders the selected option label when controlled", () => {
    const html = renderToStaticMarkup(
      <ElmSelect
        label="Pick"
        selectedOptionId="b"
        options={[
          { id: "a", label: "Apple" },
          { id: "b", label: "Banana" },
        ]}
      />,
    );
    expect(html).toContain("Banana");
  });
});
