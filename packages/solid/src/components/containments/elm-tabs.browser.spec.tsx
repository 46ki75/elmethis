import { render } from "@solidjs/testing-library";
import { page } from "vitest/browser";
import { describe, expect, it, vi } from "vitest";

import styles from "./elm-tabs.module.css";
import { ElmTab, ElmTabList, ElmTabPanel, ElmTabs } from "./elm-tabs";

describe("[Browser] ElmTabs", () => {
  it("scrolls overflowing labels and expands the selected row panel", async () => {
    const rendered = render(() => (
      <ElmTabs
        defaultValue="one"
        style={{
          "--elmethis-scoped-collapse-transition-duration": "0ms",
          width: "240px",
        }}
      >
        <ElmTabList data-testid="list">
          <ElmTab value="one">One</ElmTab>
          <ElmTab value="two">Two</ElmTab>
          <ElmTab value="three">Three</ElmTab>
          <ElmTab value="four">Four</ElmTab>
          <ElmTab value="five">Five</ElmTab>
          <ElmTab value="six">Six</ElmTab>
        </ElmTabList>
        <ElmTabPanel data-testid="one-panel" value="one">
          One content
        </ElmTabPanel>
        <ElmTabPanel data-testid="six-panel" value="six">
          Six content
        </ElmTabPanel>
      </ElmTabs>
    ));
    const screen = page.elementLocator(rendered.baseElement);
    const list = rendered.getByTestId("list");
    const firstCollapse = rendered.getByTestId("one-panel").firstElementChild!;
    const lastCollapse = rendered.getByTestId("six-panel").firstElementChild!;

    expect(getComputedStyle(list).overflowX).toBe("auto");
    expect(list.scrollWidth).toBeGreaterThan(list.clientWidth);
    expect(firstCollapse.getBoundingClientRect().height).toBeGreaterThan(0);
    expect(lastCollapse.getBoundingClientRect().height).toBe(0);

    await screen.getByText("Six", { exact: true }).click();

    await vi.waitFor(() =>
      expect(rendered.getByText("Six")).toHaveClass(styles.active),
    );
    expect(firstCollapse.getBoundingClientRect().height).toBe(0);
    expect(lastCollapse.getBoundingClientRect().height).toBeGreaterThan(0);
  });
});
