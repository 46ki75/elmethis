import { describe, expect, test } from "vitest";
import { createDOM } from "@qwik.dev/core/testing";
import { renderToString } from "@qwik.dev/core/server";

import { ElmFile } from "./elm-file";

// ElmFile renders a file card: a file icon, a name (explicit `name` prop or the
// last path segment of `src`), an optional filesize, and a download affordance.
// The actual download (fetch -> blob -> anchor.click) lives behind a click and
// touches network/Blob APIs, so the unit layer covers rendering only.

describe("[CSR] ElmFile", () => {
  test("renders the explicit name when provided", async () => {
    const { screen, render } = await createDOM();
    await render(
      <ElmFile name="report.pdf" src="https://example.com/files/x.pdf" />,
    );

    expect(screen.querySelector('[class*="elm-file"]')).toBeTruthy();
    expect(screen.outerHTML).toContain("report.pdf");
  });

  test("derives the filename from the src's last path segment when name is absent", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmFile src="https://example.com/files/photo.png?token=1" />);

    // Query/hash are stripped; the last segment is used.
    expect(screen.outerHTML).toContain("photo.png");
  });

  test("renders the filesize when supplied", async () => {
    const { screen, render } = await createDOM();
    await render(
      <ElmFile name="a.zip" src="https://example.com/a.zip" filesize="2 MB" />,
    );

    const sizeCell = screen.querySelector('[class*="file-size"]');
    expect(sizeCell).toBeTruthy();
    expect(screen.outerHTML).toContain("2 MB");
  });

  test("renders a download affordance with an icon", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmFile name="a.zip" src="https://example.com/a.zip" />);

    const download = screen.querySelector('[class*="download-icon"]');
    expect(download).toBeTruthy();
    expect(download!.querySelector("svg")).toBeTruthy();
  });
});

describe("[SSR] ElmFile", () => {
  test("server HTML emits the file card with the resolved name", async () => {
    const { html } = await renderToString(
      <ElmFile src="https://example.com/files/photo.png" />,
      { containerTagName: "div" },
    );
    expect(html).toContain("elm-file");
    expect(html).toContain("photo.png");
  });
});
