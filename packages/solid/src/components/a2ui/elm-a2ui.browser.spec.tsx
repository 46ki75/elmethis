import { render } from "@solidjs/testing-library";
import { page } from "vitest/browser";
import { describe, expect, it, vi } from "vitest";

import { SurfaceModel } from "@a2ui/web_core/v0_9";
import { NOTION_BLOCK_CATALOG_ID } from "@elmethis/core";

import { BASIC_CATALOG_ID, ElmA2ui } from "./elm-a2ui";

describe("[Browser] ElmA2ui", () => {
  it("performs native two-way binding and action dispatch", async () => {
    const actionSpy = vi.spyOn(SurfaceModel.prototype, "dispatchAction");
    const messages = [
      {
        version: "v0.9",
        createSurface: { surfaceId: "s", catalogId: BASIC_CATALOG_ID },
      },
      {
        version: "v0.9",
        updateDataModel: { surfaceId: "s", path: "/name", value: "initial" },
      },
      {
        version: "v0.9",
        updateComponents: {
          surfaceId: "s",
          components: [
            {
              component: "Column",
              id: "root",
              children: ["field", "echo", "button"],
            },
            {
              component: "TextField",
              id: "field",
              label: "Name",
              value: { path: "/name" },
            },
            { component: "Text", id: "echo", text: { path: "/name" } },
            {
              component: "Button",
              id: "button",
              child: "button-label",
              action: {
                event: { name: "save", context: { name: { path: "/name" } } },
              },
            },
            { component: "Text", id: "button-label", text: "Save" },
          ],
        },
      },
    ];
    const rendered = render(() => <ElmA2ui messages={messages} />);
    const screen = page.elementLocator(rendered.baseElement);
    await screen.getByRole("textbox").fill("Ada");
    await expect
      .element(screen.getByText("Ada", { exact: true }))
      .toBeVisible();
    await screen.getByRole("button", { name: "Save" }).click();
    expect(actionSpy).toHaveBeenCalledWith(
      { event: { name: "save", context: { name: "Ada" } } },
      "button",
    );
  });

  it("keeps RichText inline and maps hasColumnHeader to first-column row headers", async () => {
    const messages = [
      {
        version: "v0.9",
        createSurface: {
          surfaceId: "quote",
          catalogId: NOTION_BLOCK_CATALOG_ID,
        },
      },
      {
        version: "v0.9",
        updateComponents: {
          surfaceId: "quote",
          components: [
            { component: "Column", id: "root", children: ["quote", "table"] },
            { component: "BlockQuote", id: "quote", children: ["a", "b", "c"] },
            { component: "RichText", id: "a", text: "normal " },
            {
              component: "RichText",
              id: "b",
              text: "inline",
              decoration: ["bold"],
            },
            { component: "RichText", id: "c", text: " flow" },
            {
              component: "Table",
              id: "table",
              body: ["row"],
              hasColumnHeader: true,
            },
            { component: "TableRow", id: "row", children: ["key", "value"] },
            { component: "TableCell", id: "key", children: ["key-text"] },
            { component: "RichText", id: "key-text", text: "Key" },
            { component: "TableCell", id: "value", children: ["value-text"] },
            { component: "RichText", id: "value-text", text: "Value" },
          ],
        },
      },
    ];
    const rendered = render(() => <ElmA2ui messages={messages} />);
    const quote = rendered.container.querySelector("blockquote")!;
    expect(quote.textContent).toContain("normal inline flow");
    expect(
      getComputedStyle(
        rendered.container.querySelector('[data-a2ui-component-id="a"]')!,
      ).display,
    ).toBe("contents");
    expect(
      rendered.container.querySelector("tbody th[scope=row]"),
    ).toHaveTextContent("Key");
    expect(rendered.container.querySelector("tbody td")).toHaveTextContent(
      "Value",
    );
  });
});
