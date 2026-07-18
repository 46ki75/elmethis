import { render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it } from "vitest";

import { ElmFile } from "./elm-file";

describe("[CSR] ElmFile", () => {
  it("renders an explicit name, filesize, and download icon", () => {
    const { container } = render(() => (
      <ElmFile
        name="report.pdf"
        src="https://example.com/files/x.pdf"
        filesize="2 MB"
      />
    ));

    expect(container).toHaveTextContent("report.pdf");
    expect(container).toHaveTextContent("2 MB");
    expect(
      container.querySelector('[class*="download-icon"] svg'),
    ).toBeInTheDocument();
  });

  it("reactively derives the filename from src without query or hash", () => {
    const [src, setSrc] = createSignal(
      "https://example.com/files/photo.png?token=1",
    );
    const { container } = render(() => <ElmFile src={src()} />);

    expect(container).toHaveTextContent("photo.png");

    setSrc("https://example.com/files/report.pdf#page=2");

    expect(container).not.toHaveTextContent("photo.png");
    expect(container).toHaveTextContent("report.pdf");
  });

  it("merges class and forwards native attributes and refs to the root", () => {
    let root: HTMLDivElement | undefined;
    const { getByTestId } = render(() => (
      <ElmFile
        ref={(element) => {
          root = element;
        }}
        src="https://example.com/file.zip"
        class="custom-file"
        data-testid="file"
        aria-label="Download file"
      />
    ));

    const file = getByTestId("file");
    expect(file).toBe(root);
    expect(file).toHaveClass("custom-file");
    expect(file).toHaveAttribute("aria-label", "Download file");
  });
});
