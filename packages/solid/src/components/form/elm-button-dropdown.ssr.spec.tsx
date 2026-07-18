import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";

import { ElmButtonDropdown } from "./elm-button-dropdown";

const ITEMS = [
  { id: "save", label: "Save" },
  { id: "delete", label: "Delete", disabled: true },
];

describe("[SSR] ElmButtonDropdown", () => {
  it("renders two segments, menu items, and forwarded root props", () => {
    const html = renderToString(() => (
      <ElmButtonDropdown
        label="Actions"
        items={ITEMS}
        class="server-dropdown"
        data-dropdown="server"
      />
    ));

    expect(html.split("<button").length - 1).toBe(2);
    expect(html).toContain("Actions");
    expect(html).toContain("Save");
    expect(html).toContain("Delete");
    expect(html).toContain("server-dropdown");
    expect(html).toContain('data-dropdown="server"');
    expect(html).not.toContain(" items=");
    expect(html).not.toContain(" autoClose=");
  });

  it("renders controlled selection and honors segment disabled props", () => {
    const selected = renderToString(() => (
      <ElmButtonDropdown
        label="Actions"
        items={ITEMS}
        selectedOptionId="save"
        disabled
      />
    ));
    const controlledNull = renderToString(() => (
      <ElmButtonDropdown
        label="Actions"
        items={ITEMS}
        selectedOptionId={null}
        defaultSelectedOptionId="save"
        disableDropdown
      />
    ));

    expect(selected).not.toContain("Actions");
    expect(selected.split("Save").length - 1).toBe(2);
    expect(selected.split(" disabled").length - 1).toBe(2);
    expect(controlledNull).toContain("Actions");
    expect(controlledNull.split(" disabled").length - 1).toBe(1);
  });
});
