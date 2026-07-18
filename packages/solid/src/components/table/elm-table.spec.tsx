import { render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  ElmTable,
  ElmTableBody,
  ElmTableCell,
  ElmTableHeader,
  ElmTableRow,
  HasRowHeaderContext,
  TableSectionContext,
  type TableSection,
} from "./index";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("[CSR] ElmTable composition", () => {
  it("exports accessor contexts with safe standalone defaults", () => {
    const section: TableSection = TableSectionContext.defaultValue();

    expect(section).toBe("body");
    expect(HasRowHeaderContext.defaultValue()).toBe(false);
  });

  it("renders valid native sections and derives column and row headers", () => {
    const rendered = render(() => (
      <ElmTable caption="Quarterly Revenue" hasRowHeader>
        <ElmTableHeader data-testid="head">
          <ElmTableRow>
            <ElmTableCell text="Month" />
            <ElmTableCell text="Revenue" />
          </ElmTableRow>
        </ElmTableHeader>
        <ElmTableBody data-testid="body">
          <ElmTableRow>
            <ElmTableCell columnIndex={0} text="January" />
            <ElmTableCell columnIndex={1} text="10000" />
          </ElmTableRow>
        </ElmTableBody>
      </ElmTable>
    ));
    const table = rendered.getByRole("table") as HTMLTableElement;

    expect(table.caption?.textContent).toContain("Quarterly Revenue");
    expect(rendered.getByTestId("head").parentElement).toBe(table);
    expect(rendered.getByTestId("body").parentElement).toBe(table);
    expect(
      rendered.getByRole("columnheader", { name: "Month" }),
    ).toHaveAttribute("scope", "col");
    expect(
      rendered.getByRole("rowheader", { name: "January" }),
    ).toHaveAttribute("scope", "row");
    expect(rendered.getByRole("cell", { name: "10000" }).tagName).toBe("TD");
  });

  it("supports explicit header and scope overrides plus text precedence", () => {
    const rendered = render(() => (
      <table>
        <ElmTableBody>
          <ElmTableRow>
            <ElmTableCell isHeader scope="rowgroup" text="Group">
              ignored
            </ElmTableCell>
            <ElmTableCell isHeader columnIndex={0} text="Explicit" />
            <ElmTableCell>Child content</ElmTableCell>
          </ElmTableRow>
        </ElmTableBody>
      </table>
    ));

    expect(rendered.getByRole("rowheader", { name: "Group" })).toHaveAttribute(
      "scope",
      "rowgroup",
    );
    expect(rendered.queryByText("ignored")).not.toBeInTheDocument();
    expect(rendered.getByText("Explicit")).not.toHaveAttribute("scope");
    expect(
      rendered.getByRole("cell", { name: "Child content" }),
    ).toBeInTheDocument();
  });

  it("reactively updates caption, table class, text, and header promotion", () => {
    const [promote, setPromote] = createSignal(false);
    const [caption, setCaption] = createSignal<string | undefined>(undefined);
    const [text, setText] = createSignal("January");
    const rendered = render(() => (
      <ElmTable
        caption={caption()}
        hasRowHeader={promote()}
        class={promote() ? "promoted" : "plain"}
      >
        <ElmTableBody>
          <ElmTableRow>
            <ElmTableCell columnIndex={0} text={text()} />
          </ElmTableRow>
        </ElmTableBody>
      </ElmTable>
    ));

    expect(rendered.getByRole("cell", { name: "January" })).toBeInTheDocument();
    expect(rendered.getByRole("table")).toHaveClass("plain");
    expect(rendered.container.querySelector("caption")).not.toBeInTheDocument();

    setPromote(true);
    setCaption("Revenue");
    setText("February");

    expect(
      rendered.getByRole("rowheader", { name: "February" }),
    ).toHaveAttribute("scope", "row");
    expect(rendered.getByRole("table")).toHaveClass("promoted");
    expect(rendered.container.querySelector("caption")).toHaveTextContent(
      "Revenue",
    );
  });

  it("forwards native attributes, styles, and refs to each native element", () => {
    let tableRef: HTMLTableElement | undefined;
    let headRef: HTMLTableSectionElement | undefined;
    let bodyRef: HTMLTableSectionElement | undefined;
    let rowRef: HTMLTableRowElement | undefined;
    let cellRef: HTMLTableCellElement | undefined;
    const rendered = render(() => (
      <ElmTable
        ref={(element) => (tableRef = element)}
        id="revenue"
        aria-label="Revenue"
      >
        <ElmTableHeader ref={(element) => (headRef = element)} class="head" />
        <ElmTableBody ref={(element) => (bodyRef = element)} class="body">
          <ElmTableRow ref={(element) => (rowRef = element)} class="row">
            <ElmTableCell
              ref={(element) => (cellRef = element)}
              class="cell"
              colSpan={2}
              style={{ color: "red" }}
              text="value"
            />
          </ElmTableRow>
        </ElmTableBody>
      </ElmTable>
    ));

    expect(tableRef).toBe(rendered.getByRole("table", { name: "Revenue" }));
    expect(tableRef).toHaveAttribute("id", "revenue");
    expect(headRef).toHaveClass("head");
    expect(bodyRef).toHaveClass("body");
    expect(rowRef).toHaveClass("row");
    expect(cellRef).toHaveClass("cell");
    expect(cellRef).toHaveAttribute("colspan", "2");
    expect(cellRef).toHaveStyle({ color: "red" });
  });

  it("falls back to a data cell without table contexts", () => {
    const rendered = render(() => (
      <table>
        <tbody>
          <tr>
            <ElmTableCell columnIndex={0} text="Standalone" />
          </tr>
        </tbody>
      </table>
    ));

    expect(rendered.getByRole("cell", { name: "Standalone" }).tagName).toBe(
      "TD",
    );
  });

  it("disconnects its ResizeObserver and removes its scroll listener", () => {
    const observe = vi.fn();
    const disconnect = vi.fn();
    class ResizeObserverMock {
      observe = observe;
      disconnect = disconnect;
    }
    vi.stubGlobal("ResizeObserver", ResizeObserverMock);
    const rendered = render(() => <ElmTable />);
    const scrollElement = rendered.getByRole("table").parentElement!;
    const removeEventListener = vi.spyOn(scrollElement, "removeEventListener");

    expect(observe).toHaveBeenCalledWith(scrollElement);
    rendered.unmount();

    expect(disconnect).toHaveBeenCalledOnce();
    expect(removeEventListener).toHaveBeenCalledWith(
      "scroll",
      expect.any(Function),
    );
  });
});
