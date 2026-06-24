import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import {
  ElmButtonDropdown,
  type ElmButtonDropdownItem,
} from "./elm-button-dropdown";

const ITEMS: ElmButtonDropdownItem[] = [
  { id: "save", label: "Save" },
  { id: "delete", label: "Delete", disabled: true },
];

describe("[SSR] ElmButtonDropdown", () => {
  it("renders the main label and the menu items", () => {
    const html = renderToStaticMarkup(
      <ElmButtonDropdown label="Actions" items={ITEMS} />,
    );
    expect(html).toContain("Actions");
    expect(html).toContain("Save");
    expect(html).toContain("Delete");
  });

  it("shows the placeholder when nothing is selected and the option once selected", () => {
    const placeholder = renderToStaticMarkup(
      <ElmButtonDropdown label="Pick an action" items={ITEMS} />,
    );
    expect(placeholder).toContain("Pick an action");

    const selected = renderToStaticMarkup(
      <ElmButtonDropdown
        label="Pick an action"
        selectedOptionId="save"
        items={ITEMS}
      />,
    );
    // The main button now reflects the selected option, so the placeholder is
    // gone and "Save" appears for both the main button and the menu row.
    expect(selected).not.toContain("Pick an action");
    expect(selected.split("Save").length - 1).toBe(2);
  });

  it("renders two buttons: the main action and the caret toggle", () => {
    const html = renderToStaticMarkup(
      <ElmButtonDropdown label="Save" items={ITEMS} />,
    );
    const count = html.split("<button").length - 1;
    expect(count).toBe(2);
  });

  it("disables both buttons when the whole control is disabled", () => {
    const html = renderToStaticMarkup(
      <ElmButtonDropdown label="Save" disabled items={ITEMS} />,
    );
    // Both the main button and the caret button carry the disabled attribute.
    expect(html.match(/<button disabled/g)?.length).toBe(2);
  });

  it("disables only the caret when disableDropdown is set", () => {
    const html = renderToStaticMarkup(
      <ElmButtonDropdown label="Save" disableDropdown items={ITEMS} />,
    );
    expect(html.match(/<button disabled/g)?.length).toBe(1);
  });

  it("disables only the main button when disableMainButton is set", () => {
    const html = renderToStaticMarkup(
      <ElmButtonDropdown label="Save" disableMainButton items={ITEMS} />,
    );
    expect(html.match(/<button disabled/g)?.length).toBe(1);
  });
});
