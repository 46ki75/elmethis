import { renderToString } from "solid-js/web";
import { Window } from "happy-dom";
import { describe, expect, it } from "vitest";

import { NOTION_BLOCK_CATALOG_ID } from "@elmethis/core";

import { ElmA2ui } from "./elm-a2ui";

describe("[SSR] ElmA2ui", () => {
  it("renders controlled messages as a complete surface", () => {
    const html = renderToString(() => (
      <ElmA2ui
        class="server-surface"
        data-renderer="solid"
        messages={[
          {
            version: "v0.9",
            createSurface: {
              surfaceId: "article",
              catalogId: NOTION_BLOCK_CATALOG_ID,
            },
          },
          {
            version: "v0.9",
            updateComponents: {
              surfaceId: "article",
              components: [
                {
                  component: "Column",
                  id: "root",
                  children: ["paragraph", "code"],
                },
                {
                  component: "Paragraph",
                  id: "paragraph",
                  children: ["text"],
                },
                {
                  component: "RichText",
                  id: "text",
                  text: "Server-rendered article body",
                },
                {
                  component: "CodeBlock",
                  id: "code",
                  language: "typescript",
                  code: "const ssr = true;",
                },
              ],
            },
          },
        ]}
      />
    ));
    expect(html).toContain("server-surface");
    expect(html).toContain('data-renderer="solid"');
    expect(html).toContain('data-a2ui-surface-id="article"');
    expect(html).toContain('data-a2ui-component-id="root"');
    expect(html).toContain("Server-rendered article body");
    expect(html).toContain("const ssr = true;");
    expect(html).not.toContain("window");
  });

  it("does not wrap table rows or cells in invalid span hosts", () => {
    const html = renderToString(() => (
      <ElmA2ui
        messages={[
          {
            version: "v0.9",
            createSurface: {
              surfaceId: "table",
              catalogId: NOTION_BLOCK_CATALOG_ID,
            },
          },
          {
            version: "v0.9",
            updateComponents: {
              surfaceId: "table",
              components: [
                {
                  component: "Table",
                  id: "root",
                  header: ["header-row"],
                  body: ["body-row"],
                },
                {
                  component: "TableRow",
                  id: "header-row",
                  children: ["header-cell"],
                },
                {
                  component: "TableCell",
                  id: "header-cell",
                  children: ["header-text"],
                },
                {
                  component: "RichText",
                  id: "header-text",
                  text: "heading",
                },
                {
                  component: "TableRow",
                  id: "body-row",
                  children: ["body-cell"],
                },
                {
                  component: "TableCell",
                  id: "body-cell",
                  children: ["body-text"],
                },
                { component: "RichText", id: "body-text", text: "value" },
              ],
            },
          },
        ]}
      />
    ));

    expect(html).not.toMatch(
      /<span[^>]*data-a2ui-component-id="(?:header|body)-(?:row|cell)"/,
    );
    const document = new Window().document;
    document.body.innerHTML = html;
    const headerRow = document.querySelector(
      '[data-a2ui-component-id="header-row"]',
    );
    const headerCell = document.querySelector(
      '[data-a2ui-component-id="header-cell"]',
    );
    const bodyRow = document.querySelector(
      '[data-a2ui-component-id="body-row"]',
    );
    const bodyCell = document.querySelector(
      '[data-a2ui-component-id="body-cell"]',
    );

    expect(headerRow?.tagName).toBe("TR");
    expect(headerRow?.parentElement?.tagName).toBe("THEAD");
    expect(headerRow?.getAttribute("data-a2ui-component-key")).toBe(
      "header-row@/",
    );
    expect(headerCell?.tagName).toBe("TH");
    expect(headerCell?.parentElement).toBe(headerRow);
    expect(headerCell?.getAttribute("data-a2ui-component-key")).toBe(
      "header-cell@/",
    );
    expect(bodyRow?.tagName).toBe("TR");
    expect(bodyRow?.parentElement?.tagName).toBe("TBODY");
    expect(bodyCell?.tagName).toBe("TD");
    expect(bodyCell?.parentElement).toBe(bodyRow);
    expect(html).toContain("heading");
    expect(html).toContain("value");
  });
});
