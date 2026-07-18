import { render } from "@solidjs/testing-library";
import { page } from "vitest/browser";
import { describe, expect, it, vi } from "vitest";

import { ElmTable } from "./elm-table";
import { ElmTableBody } from "./elm-table-body";
import { ElmTableCell } from "./elm-table-cell";
import { ElmTableHeader } from "./elm-table-header";
import { ElmTableRow } from "./elm-table-row";

describe("[Browser] ElmTable", () => {
  it("focuses only an overflowing table and tracks both scroll edges", async () => {
    const rendered = render(() => (
      <div style={{ width: "240px" }}>
        <ElmTable
          caption="Wide revenue table"
          hasRowHeader
          style={{ width: "720px" }}
        >
          <ElmTableHeader>
            <ElmTableRow>
              <ElmTableCell text="Region" />
              <ElmTableCell text="January" />
              <ElmTableCell text="February" />
            </ElmTableRow>
          </ElmTableHeader>
          <ElmTableBody>
            <ElmTableRow>
              <ElmTableCell columnIndex={0} text="North" />
              <ElmTableCell columnIndex={1} text="1000" />
              <ElmTableCell columnIndex={2} text="2000" />
            </ElmTableRow>
          </ElmTableBody>
        </ElmTable>
      </div>
    ));
    const screen = page.elementLocator(rendered.baseElement);
    const table = rendered.getByRole("table");
    const scrollElement = table.parentElement!;
    const frame = scrollElement.parentElement!;

    await expect
      .element(screen.getByRole("region", { name: "Wide revenue table" }))
      .toBeInTheDocument();
    await vi.waitFor(() =>
      expect(scrollElement).toHaveAttribute("tabindex", "0"),
    );
    expect(frame).not.toHaveAttribute("data-overflow-start");
    expect(frame).toHaveAttribute("data-overflow-end");
    expect(
      getComputedStyle(rendered.getByRole("rowheader", { name: "North" }))
        .position,
    ).toBe("sticky");

    scrollElement.scrollLeft = 100;
    scrollElement.dispatchEvent(new Event("scroll"));
    await vi.waitFor(() =>
      expect(frame).toHaveAttribute("data-overflow-start"),
    );

    scrollElement.scrollLeft = scrollElement.scrollWidth;
    scrollElement.dispatchEvent(new Event("scroll"));
    await vi.waitFor(() =>
      expect(frame).not.toHaveAttribute("data-overflow-end"),
    );
  });

  it("leaves a non-overflowing table unfocusable and disconnects its observer", async () => {
    const disconnect = vi.spyOn(ResizeObserver.prototype, "disconnect");
    const rendered = render(() => (
      <div style={{ width: "600px" }}>
        <ElmTable caption="Small table">
          <ElmTableBody>
            <ElmTableRow>
              <ElmTableCell text="value" />
            </ElmTableRow>
          </ElmTableBody>
        </ElmTable>
      </div>
    ));
    const scrollElement = rendered.getByRole("table").parentElement!;

    await vi.waitFor(() =>
      expect(scrollElement.scrollWidth).toBeLessThanOrEqual(
        scrollElement.clientWidth + 1,
      ),
    );
    expect(scrollElement).not.toHaveAttribute("tabindex");
    expect(scrollElement).not.toHaveAttribute("role");

    rendered.unmount();
    expect(disconnect).toHaveBeenCalled();
  });
});
