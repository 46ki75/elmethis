import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";

import { ElmFile } from "./elm-file";

describe("[SSR] ElmFile", () => {
  it("renders the resolved filename and forwarded attributes without browser APIs", () => {
    const html = renderToString(() => (
      <ElmFile
        src="https://example.com/files/photo.png?token=1"
        filesize="2 MB"
        class="custom-file"
        data-file="download"
      />
    ));

    expect(html).toContain("photo.png");
    expect(html).toContain("2 MB");
    expect(html).toContain("custom-file");
    expect(html).toContain('data-file="download"');
  });
});
