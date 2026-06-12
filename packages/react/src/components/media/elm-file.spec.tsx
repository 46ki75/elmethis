import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";

import { ElmFile } from "./elm-file";

// ElmFile renders a file card: a file icon, a name (explicit `name` prop or the
// last path segment of `src`), an optional filesize, and a download affordance.
// The actual download (fetch -> blob -> anchor.click) lives behind a click and
// touches network/Blob APIs, so the unit layer covers rendering only.

describe("[CSR] ElmFile", () => {
  it("renders the explicit name when provided", () => {
    const { container } = render(
      <ElmFile name="report.pdf" src="https://example.com/files/x.pdf" />,
    );

    expect(container.querySelector('[class*="elm-file"]')).toBeTruthy();
    expect(container.textContent).toContain("report.pdf");
  });

  it("derives the filename from the src's last path segment when name is absent", () => {
    const { container } = render(
      <ElmFile src="https://example.com/files/photo.png?token=1" />,
    );

    // Query/hash are stripped; the last segment is used.
    expect(container.textContent).toContain("photo.png");
  });

  it("renders the filesize when supplied", () => {
    const { container } = render(
      <ElmFile name="a.zip" src="https://example.com/a.zip" filesize="2 MB" />,
    );

    const sizeCell = container.querySelector('[class*="file-size"]');
    expect(sizeCell).toBeTruthy();
    expect(container.textContent).toContain("2 MB");
  });

  it("renders a download affordance with an icon", () => {
    const { container } = render(
      <ElmFile name="a.zip" src="https://example.com/a.zip" />,
    );

    const download = container.querySelector('[class*="download-icon"]');
    expect(download).toBeTruthy();
    expect(download!.querySelector("svg")).toBeTruthy();
  });

  it("merges a passthrough className onto the root", () => {
    const { container } = render(
      <ElmFile
        className="custom-class"
        name="a.zip"
        src="https://example.com/a.zip"
      />,
    );
    expect(container.querySelector('[class*="elm-file"]')).toHaveClass(
      "custom-class",
    );
  });
});

describe("[SSR] ElmFile", () => {
  it("server HTML emits the file card with the resolved name", () => {
    const html = renderToStaticMarkup(
      <ElmFile src="https://example.com/files/photo.png" />,
    );
    expect(html).toContain("elm-file");
    expect(html).toContain("photo.png");
  });
});
