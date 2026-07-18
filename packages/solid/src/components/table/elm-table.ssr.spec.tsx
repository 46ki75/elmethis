import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";

import { ElmTable } from "./elm-table";
import { ElmTableBody } from "./elm-table-body";
import { ElmTableCell } from "./elm-table-cell";
import { ElmTableHeader } from "./elm-table-header";
import { ElmTableRow } from "./elm-table-row";

describe("[SSR] ElmTable", () => {
  it("renders its caption, valid sections, and derived header semantics", () => {
    const html = renderToString(() => (
      <ElmTable caption="Quarterly Revenue" hasRowHeader id="revenue">
        <ElmTableHeader>
          <ElmTableRow>
            <ElmTableCell text="Month" />
          </ElmTableRow>
        </ElmTableHeader>
        <ElmTableBody>
          <ElmTableRow>
            <ElmTableCell columnIndex={0} text="January" />
            <ElmTableCell columnIndex={1} text="10000" />
          </ElmTableRow>
        </ElmTableBody>
      </ElmTable>
    ));

    expect(html).toContain('<table id="revenue"');
    expect(html).toContain("<caption");
    expect(html).toContain("Quarterly Revenue");
    expect(html).toMatch(
      /<table[^>]*>.*<caption[^>]*>.*<thead[^>]*>.*<tbody[^>]*>/,
    );
    expect(html).toMatch(/<th[^>]*scope="col"[^>]*>Month<\/th>/);
    expect(html).toMatch(/<th[^>]*scope="row"[^>]*>January<\/th>/);
    expect(html).toMatch(/<td[^>]*>10000<\/td>/);
  });

  it("keeps client-only overflow affordances out of server markup", () => {
    const html = renderToString(() => (
      <ElmTable caption="Revenue">
        <ElmTableBody />
      </ElmTable>
    ));

    expect(html).not.toContain("data-overflow-start");
    expect(html).not.toContain("data-overflow-end");
    expect(html).not.toContain('tabindex="0"');
    expect(html).not.toContain('role="region"');
  });
});
