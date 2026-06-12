import { describe, expect, test } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";

import { ElmA2ui } from "./elm-a2ui";

const CATALOG_ID = "https://a2ui.org/specification/v0_9/basic_catalog.json";

// ElmA2ui drives a `@a2ui/web_core` MessageProcessor and renders each surface
// through the official `A2uiSurface`. The MessageProcessor and the generic
// binder build on mount (effects + useSyncExternalStore), so CSR assertions
// wait for the surface to resolve. SSR (no effects) must still render the
// wrapper without throwing.

const basicSurface = [
  { version: "v0.9", createSurface: { surfaceId: "s", catalogId: CATALOG_ID } },
  {
    version: "v0.9",
    updateComponents: {
      surfaceId: "s",
      components: [
        { component: "Column", id: "root", children: ["title", "body"] },
        { component: "Text", id: "title", variant: "h2", text: "A2UI Title" },
        { component: "Text", id: "body", text: "Body paragraph." },
      ],
    },
  },
] as object[];

const blockHeadingSurface = [
  { version: "v0.9", createSurface: { surfaceId: "b", catalogId: CATALOG_ID } },
  {
    version: "v0.9",
    updateComponents: {
      surfaceId: "b",
      components: [
        // "Heading" resolves to the Elm block renderer (ElmHeading → <h2>),
        // its child to the official Text renderer.
        { component: "Heading", id: "root", level: 2, children: ["t"] },
        { component: "Text", id: "t", text: "Block Heading" },
      ],
    },
  },
] as object[];

describe("[CSR] ElmA2ui", () => {
  test("renders a basic-catalog surface from a message list", async () => {
    const { container } = render(<ElmA2ui messages={basicSurface} />);
    await waitFor(() => {
      expect(container.textContent).toContain("A2UI Title");
    });
    expect(container.textContent).toContain("Body paragraph.");
  });

  test("renders an Elm block component (Heading → <h2>)", async () => {
    const { container } = render(<ElmA2ui messages={blockHeadingSurface} />);
    await waitFor(() => {
      expect(container.textContent).toContain("Block Heading");
    });
    expect(container.querySelector("h2")).not.toBeNull();
  });

  test("renders nothing harmful for an empty message list", () => {
    const { container } = render(<ElmA2ui messages={[]} />);
    // The root wrapper exists; no surfaces.
    expect(container.querySelector("div")).not.toBeNull();
    expect(container.textContent).toBe("");
  });
});

describe("[SSR] ElmA2ui", () => {
  test("renders the wrapper without throwing (no surfaces server-side)", () => {
    // Effects don't run during SSR, so the processor never builds — the
    // component must still emit its wrapper rather than crash.
    const html = renderToStaticMarkup(<ElmA2ui messages={basicSurface} />);
    expect(typeof html).toBe("string");
    expect(html).toContain("<div");
  });
});
