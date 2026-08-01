import { render } from "vitest-browser-react";
import { describe, expect, test, vi } from "vitest";

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
