import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";

import { ElmList } from "./elm-list";

describe("[SSR] ElmList", () => {
  it("renders ordered and unordered roots with native attributes", () => {
    const html = renderToString(() => (
      <>
        <ElmList
          listStyle="ordered"
          type="a"
          class="ordered-list"
          data-list="ordered"
        >
          <li>one</li>
        </ElmList>
        <ElmList listStyle="unordered" aria-label="Items">
          <li>two</li>
        </ElmList>
      </>
    ));

    expect(html).toContain("<ol");
    expect(html).toContain("<ul");
    expect(html).toContain('type="a"');
    expect(html).toContain('data-list="ordered"');
    expect(html).toContain('aria-label="Items"');
    expect(html).toContain("ordered-list");
    expect(html).toContain("one");
    expect(html).toContain("two");
  });
});
