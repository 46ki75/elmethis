import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";

import { ElmModal } from "./elm-modal";

describe("[SSR] ElmModal", () => {
  it("renders its native dialog shell and content without browser APIs", () => {
    const html = renderToString(() => (
      <ElmModal isOpen delay={450} class="custom-modal" data-modal="example">
        <span>Modal body</span>
      </ElmModal>
    ));

    expect(html).toContain("<dialog");
    expect(html).toContain("Modal body");
    expect(html).toContain("custom-modal");
    expect(html).toContain('data-modal="example"');
    expect(html).toContain('closedby="none"');
    expect(html).toContain("--elmethis-scoped-modal-delay:450ms");
    expect(html).not.toContain("<template");
  });
});
