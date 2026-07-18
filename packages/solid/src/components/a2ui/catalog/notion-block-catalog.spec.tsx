import { describe, expect, it } from "vitest";

import { basicCatalog } from "./basic-catalog";
import {
  notionBlockCatalog,
  notionBlockComponents,
  notionBlockFunctions,
} from "./notion-block-catalog";

describe("notionBlockCatalog", () => {
  it("contains the full basic and Notion component breadth", () => {
    const expectedNames = new Set([
      "Audio",
      "AudioPlayer",
      "BlockImage",
      "BlockQuote",
      "Bookmark",
      "Button",
      "Callout",
      "Card",
      "CheckBox",
      "ChoicePicker",
      "CodeBlock",
      "Column",
      "ColumnList",
      "ContentTab",
      "ContentTabs",
      "DateTimeInput",
      "Divider",
      "File",
      "Heading",
      "Html",
      "Icon",
      "Image",
      "Katex",
      "LinkText",
      "List",
      "ListItem",
      "Mermaid",
      "Modal",
      "NotionCallout",
      "Paragraph",
      "RichText",
      "Row",
      "Slider",
      "Table",
      "TableCell",
      "TableRow",
      "Tabs",
      "Text",
      "TextField",
      "Toggle",
      "Unsupported",
      "Video",
    ]);

    expect(new Set(notionBlockCatalog.names())).toEqual(expectedNames);
    expect(basicCatalog.names().every((name) => expectedNames.has(name))).toBe(
      true,
    );
  });

  it("exports exactly the definitions and functions used by processor catalogs", () => {
    expect(notionBlockComponents).toEqual([
      ...notionBlockCatalog.components.values(),
    ]);
    expect(notionBlockFunctions).toEqual(notionBlockCatalog.functions);
    expect(
      notionBlockComponents.every(
        (component) =>
          typeof component.render === "function" && component.schema != null,
      ),
    ).toBe(true);
  });
});
