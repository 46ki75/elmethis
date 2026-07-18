import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";

import { ElmSelect } from "./elm-select";

const OPTIONS = [
  { id: "a", label: "Apple" },
  { id: "b", label: "Banana" },
];

describe("[SSR] ElmSelect", () => {
  it("renders its placeholder and forwarded root props server-side", () => {
    const html = renderToString(() => (
      <ElmSelect
        label="Fruit"
        placeholder="Choose one"
        options={OPTIONS}
        class="server-select"
        data-select="server"
      />
    ));

    expect(html).toContain("Fruit");
    expect(html).toContain("Choose one");
    expect(html).toContain("Apple");
    expect(html).toContain("server-select");
    expect(html).toContain('data-select="server"');
    expect(html).not.toContain(" selectedOptionId=");
    expect(html).not.toContain(" options=");
  });

  it("honors selected ids, including controlled null over a default", () => {
    const selected = renderToString(() => (
      <ElmSelect label="Fruit" options={OPTIONS} selectedOptionId="b" />
    ));
    const controlledNull = renderToString(() => (
      <ElmSelect
        label="Fruit"
        options={OPTIONS}
        selectedOptionId={null}
        defaultSelectedOptionId="a"
      />
    ));

    expect(selected).toContain("Banana");
    expect(controlledNull).toContain("Select an option");
  });
});
