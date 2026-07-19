import { renderToString } from "solid-js/web";
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
});
