import { describe, expect, test } from "vitest";
import { createDOM } from "@qwik.dev/core/testing";
import type { UserMessage } from "@ag-ui/client";

import { ElmAgUiInputContent } from "./elm-ag-ui-input-content";

// `inputContent` is the AG-UI `UserMessage["content"]` union: either a plain
// string or an array of typed content parts (text / image / document / …).
// These smoke tests cover the branches that produce visible output; audio /
// video / binary parts intentionally render empty fragments and are not
// asserted on.

type Content = UserMessage["content"];

describe("[CSR] ElmAgUiInputContent", () => {
  test("renders a plain string content", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmAgUiInputContent inputContent={"hello there"} />);
    expect(screen.outerHTML).toContain("hello there");
  });

  test("joins text parts from a content array", async () => {
    const content: Content = [
      { type: "text", text: "line one" },
      { type: "text", text: "line two" },
    ] as Content;
    const { screen, render } = await createDOM();
    await render(<ElmAgUiInputContent inputContent={content} />);
    expect(screen.outerHTML).toContain("line one");
    expect(screen.outerHTML).toContain("line two");
  });

  test("renders an image part as an <img> with the resolved data URL", async () => {
    const content: Content = [
      {
        type: "image",
        source: { type: "data", mimeType: "image/png", value: "AAAA" },
      },
    ] as Content;
    const { screen, render } = await createDOM();
    await render(<ElmAgUiInputContent inputContent={content} />);
    expect(screen.outerHTML).toContain("<img");
    expect(screen.outerHTML).toContain("data:image/png;base64,AAAA");
    expect(screen.outerHTML).toContain("image/png");
  });

  test("renders an image part with a direct url source", async () => {
    const content: Content = [
      {
        type: "image",
        source: { type: "url", value: "https://example.test/a.png" },
      },
    ] as Content;
    const { screen, render } = await createDOM();
    await render(<ElmAgUiInputContent inputContent={content} />);
    expect(screen.outerHTML).toContain("https://example.test/a.png");
  });

  test("renders a document part with its mime type and text", async () => {
    const content: Content = [
      {
        type: "document",
        source: { type: "data", mimeType: "text/plain", value: "doc body" },
      },
    ] as Content;
    const { screen, render } = await createDOM();
    await render(<ElmAgUiInputContent inputContent={content} />);
    expect(screen.outerHTML).toContain("doc body");
    expect(screen.outerHTML).toContain("text/plain");
  });
});
