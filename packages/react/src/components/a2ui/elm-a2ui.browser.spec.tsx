import { render } from "vitest-browser-react";
import { describe, expect, test, vi } from "vitest";
import { SurfaceModel } from "@a2ui/web_core/v0_9";

import { ElmA2ui } from "./elm-a2ui";

const CATALOG_ID = "https://a2ui.org/specification/v0_9/basic_catalog.json";

const xssSurface = [
  { version: "v0.9", createSurface: { surfaceId: "x", catalogId: CATALOG_ID } },
  {
    version: "v0.9",
    updateComponents: {
      surfaceId: "x",
      components: [
        {
          component: "Text",
          id: "root",
          text: 'safe text <img src=x onerror="window.__xss=1">',
        },
      ],
    },
  },
] as object[];

describe("[CSR] ElmA2ui mixed catalog", () => {
  test("binds Web Component inputs through React blocks under a custom catalog id", async () => {
    const actionSpy = vi.spyOn(SurfaceModel.prototype, "dispatchAction");
    try {
      const messages = [
        {
          version: "v0.9",
          createSurface: { surfaceId: "mixed", catalogId: "urn:test:mixed" },
        },
        {
          version: "v0.9",
          updateDataModel: {
            surfaceId: "mixed",
            path: "/name",
            value: "initial",
          },
        },
        {
          version: "v0.9",
          updateComponents: {
            surfaceId: "mixed",
            components: [
              {
                component: "Row",
                id: "root",
                children: ["heading", "field", "echo", "save"],
              },
              {
                component: "Heading",
                id: "heading",
                level: 2,
                children: ["title"],
              },
              { component: "Text", id: "title", text: "Mixed catalog" },
              {
                component: "TextField",
                id: "field",
                label: "Name",
                value: { path: "/name" },
              },
              { component: "RichText", id: "echo", text: { path: "/name" } },
              {
                component: "Button",
                id: "save",
                child: "save-label",
                action: {
                  event: { name: "save", context: { name: { path: "/name" } } },
                },
              },
              { component: "Text", id: "save-label", text: "Save" },
            ],
          },
        },
      ];
      const screen = await render(<ElmA2ui messages={messages} />);
      await expect
        .element(screen.getByRole("heading", { name: "Mixed catalog" }))
        .toBeVisible();
      await screen.getByRole("textbox").fill("Ada");
      await expect
        .element(screen.getByText("Ada", { exact: true }))
        .toBeVisible();
      await screen.getByRole("button", { name: "Save" }).click();
      expect(actionSpy).toHaveBeenCalledWith(
        { event: { name: "save", context: { name: "Ada" } } },
        "save",
      );
    } finally {
      actionSpy.mockRestore();
    }
  });
});

describe("[CSR] ElmA2ui markdown sanitization", () => {
  test("strips dangerous attributes from agent-authored markdown", async () => {
    const screen = await render(<ElmA2ui messages={xssSurface} />);
    await vi.waitFor(() => {
      expect(screen.container.textContent).toContain("safe text");
    });
    // DOMPurify must drop the event handler that dangerouslySetInnerHTML
    // would otherwise activate.
    expect(screen.container.querySelector("img[onerror]")).toBeNull();
    expect(screen.container.innerHTML).not.toContain("onerror");
  });
});
