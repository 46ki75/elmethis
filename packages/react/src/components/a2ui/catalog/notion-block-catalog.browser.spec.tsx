import { render } from "vitest-browser-react";
import { describe, expect, test, vi } from "vitest";

import { ElmA2ui } from "../elm-a2ui";

const CATALOG_ID = "https://a2ui.org/specification/v0_9/basic_catalog.json";

const inlineRichTextBlockQuoteSurface = [
  {
    version: "v0.9",
    createSurface: { surfaceId: "blockquote", catalogId: CATALOG_ID },
  },
  {
    version: "v0.9",
    updateComponents: {
      surfaceId: "blockquote",
      components: [
        {
          component: "BlockQuote",
          id: "root",
          children: ["t1", "t2", "t3", "t4", "t5", "t6", "t7"],
        },
        { component: "RichText", id: "t1", text: "Could you " },
        {
          component: "RichText",
          id: "t2",
          text: "look",
          color: "#b8a36e",
          decoration: ["bold", "underline"],
        },
        { component: "RichText", id: "t3", text: " " },
        {
          component: "RichText",
          id: "t4",
          text: "into",
          color: "#b8a36e",
          decoration: ["bold", "underline"],
        },
        {
          component: "RichText",
          id: "t5",
          text: " whether there's any way to make this ",
        },
        {
          component: "RichText",
          id: "t6",
          text: "happen",
          color: "#b8a36e",
          decoration: ["bold", "underline"],
        },
        { component: "RichText", id: "t7", text: "?" },
      ],
    },
  },
] as object[];

describe("[CSR] notionBlockCatalog BlockQuote", () => {
  test("keeps direct RichText children in normal inline flow", async () => {
    const screen = await render(
      <ElmA2ui messages={inlineRichTextBlockQuoteSurface} />,
    );

    await vi.waitFor(() => {
      expect(screen.container.textContent).toContain(
        "Could you look into whether there's any way to make this happen?",
      );
    });

    const body = screen.container.querySelector(
      "blockquote > div:nth-of-type(2)",
    );
    expect(body).not.toBeNull();
    expect(body?.children).toHaveLength(7);
    expect(getComputedStyle(body!).display).toBe("block");
  });
});
