import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";

import { ElmTab, ElmTabList, ElmTabPanel, ElmTabs } from "./elm-tabs";

describe("[SSR] ElmTabs", () => {
  it("renders initial compound markup and forwarded props server-side", () => {
    const html = renderToString(() => (
      <ElmTabs
        class="server-tabs"
        data-tabs="server"
        defaultValue="tab2"
        transitionTimingFunction="linear"
      >
        <ElmTabList data-list="server">
          <ElmTab value="tab1">Tab 1</ElmTab>
          <ElmTab class="selected-tab" value="tab2">
            Tab 2
          </ElmTab>
        </ElmTabList>
        <ElmTabPanel value="tab1">Content 1</ElmTabPanel>
        <ElmTabPanel data-panel="server" value="tab2">
          Content 2
        </ElmTabPanel>
      </ElmTabs>
    ));

    expect(html).toContain("Tab 1");
    expect(html).toContain("Tab 2");
    expect(html).toContain("Content 1");
    expect(html).toContain("Content 2");
    expect(html).toContain("server-tabs");
    expect(html).toContain("selected-tab");
    expect(html).toContain('data-tabs="server"');
    expect(html).toContain('data-list="server"');
    expect(html).toContain('data-panel="server"');
    expect(html).toContain(
      "--elmethis-scoped-transition-timing-function:linear",
    );
    expect(html).not.toContain("defaultValue=");
    expect(html).not.toContain("transitionTimingFunction=");
    expect(html).not.toContain('value="tab');
  });
});
