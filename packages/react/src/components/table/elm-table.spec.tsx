import { describe, expect, test } from "vitest";
import { render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import type { ReactElement } from "react";

import { ElmTable } from "./elm-table";
import { ElmTableHeader } from "./elm-table-header";
import { ElmTableBody } from "./elm-table-body";
import { ElmTableRow } from "./elm-table-row";
import { ElmTableCell } from "./elm-table-cell";

// Render a JSX tree (CSR) and return the rendered HTML, lowercased so callers
// can match `<th>` / `<td>` / attribute names without worrying about casing.
const renderHTML = (node: ReactElement) => {
  const { container } = render(node);
  return container.innerHTML.toLowerCase();
};

describe("[CSR] ElmTable — header section", () => {
  test("cells inside <ElmTableHeader> become <th scope='col'>", () => {
    const html = renderHTML(
      <ElmTable>
        <ElmTableHeader>
          <ElmTableRow>
            <ElmTableCell text="Name" />
          </ElmTableRow>
        </ElmTableHeader>
      </ElmTable>,
    );
    expect(html).toContain("<th");
    expect(html).toContain('scope="col"');
    expect(html).toContain("name");
  });

  test("cells inside <ElmTableBody> stay <td>", () => {
    const html = renderHTML(
      <ElmTable>
        <ElmTableBody>
          <ElmTableRow>
            <ElmTableCell text="cell" />
          </ElmTableRow>
        </ElmTableBody>
      </ElmTable>,
    );
    expect(html).toContain("<td");
    expect(html).not.toContain("<th");
  });
});

describe("[CSR] ElmTable — row-header promotion (hasRowHeader + columnIndex)", () => {
  test("columnIndex=0 in a hasRowHeader table becomes <th scope='row'>", () => {
    const html = renderHTML(
      <ElmTable hasRowHeader>
        <ElmTableBody>
          <ElmTableRow>
            <ElmTableCell columnIndex={0} text="January" />
            <ElmTableCell columnIndex={1} text="10000" />
          </ElmTableRow>
        </ElmTableBody>
      </ElmTable>,
    );
    // First cell: <th scope="row">
    expect(html).toMatch(/<th[^>]*scope="row"[^>]*>[^<]*january/);
    // Sibling cell: still <td>
    expect(html).toMatch(/<td[^>]*>[^<]*10000/);
  });

  test("columnIndex>0 stays <td> even when hasRowHeader is on", () => {
    const html = renderHTML(
      <ElmTable hasRowHeader>
        <ElmTableBody>
          <ElmTableRow>
            <ElmTableCell columnIndex={1} text="not-a-header" />
          </ElmTableRow>
        </ElmTableBody>
      </ElmTable>,
    );
    expect(html).toContain("<td");
    expect(html).not.toContain("<th");
  });

  test("columnIndex=0 without hasRowHeader stays <td>", () => {
    const html = renderHTML(
      <ElmTable>
        <ElmTableBody>
          <ElmTableRow>
            <ElmTableCell columnIndex={0} text="plain" />
          </ElmTableRow>
        </ElmTableBody>
      </ElmTable>,
    );
    expect(html).toContain("<td");
    expect(html).not.toContain("<th");
  });
});

describe("[CSR] ElmTable — explicit overrides", () => {
  test("isHeader=true in body renders <th> without auto scope", () => {
    const html = renderHTML(
      <ElmTable>
        <ElmTableBody>
          <ElmTableRow>
            <ElmTableCell isHeader text="custom-header" />
          </ElmTableRow>
        </ElmTableBody>
      </ElmTable>,
    );
    expect(html).toContain("<th");
    expect(html).toContain("custom-header");
    // Consumer can supply their own scope; we don't auto-derive in this path.
    expect(html).not.toContain('scope="col"');
    expect(html).not.toContain('scope="row"');
  });

  test("scope prop overrides the auto-derived scope", () => {
    const html = renderHTML(
      <ElmTable>
        <ElmTableHeader>
          <ElmTableRow>
            <ElmTableCell scope="rowgroup" text="overridden" />
          </ElmTableRow>
        </ElmTableHeader>
      </ElmTable>,
    );
    expect(html).toContain('scope="rowgroup"');
    expect(html).not.toContain('scope="col"');
  });

  test("native td attrs (colSpan) flow through to <th>", () => {
    const html = renderHTML(
      <ElmTable>
        <ElmTableHeader>
          <ElmTableRow>
            <ElmTableCell colSpan={3} text="spanned" />
          </ElmTableRow>
        </ElmTableHeader>
      </ElmTable>,
    );
    expect(html).toContain('colspan="3"');
  });
});

// Smoke test: an `<ElmTableCell>` rendered with no surrounding `<ElmTable>` /
// section providers should still render — the cell falls back to the
// non-reactive context defaults.
describe("[CSR] ElmTableCell — no table ancestor", () => {
  test("renders <td> when not under any provider", () => {
    const { container } = render(
      <table>
        <tbody>
          <tr>
            <ElmTableCell text="plain" />
          </tr>
        </tbody>
      </table>,
    );
    const html = container.innerHTML.toLowerCase();
    expect(html).toContain("<td");
    expect(html).not.toContain("<th");
    expect(html).toContain("plain");
  });

  test("text prop takes precedence over children", () => {
    const { container } = render(
      <table>
        <tbody>
          <tr>
            <ElmTableCell text="from-prop">should-not-show</ElmTableCell>
          </tr>
        </tbody>
      </table>,
    );
    const html = container.innerHTML.toLowerCase();
    expect(html).toContain("from-prop");
    expect(html).not.toContain("should-not-show");
  });

  test("renders children when text is absent", () => {
    const { container } = render(
      <table>
        <tbody>
          <tr>
            <ElmTableCell>
              <span>slot-content</span>
            </ElmTableCell>
          </tr>
        </tbody>
      </table>,
    );
    expect(container.innerHTML.toLowerCase()).toContain("slot-content");
  });
});

describe("[SSR] ElmTable", () => {
  test("renders the table shell with caption server-side", () => {
    const html = renderToStaticMarkup(
      <ElmTable caption="SSR Caption">
        <ElmTableHeader>
          <ElmTableRow>
            <ElmTableCell text="Name" />
          </ElmTableRow>
        </ElmTableHeader>
        <ElmTableBody>
          <ElmTableRow>
            <ElmTableCell text="value" />
          </ElmTableRow>
        </ElmTableBody>
      </ElmTable>,
    ).toLowerCase();
    expect(html).toContain("<table");
    expect(html).toContain("<caption");
    expect(html).toContain("ssr caption");
    expect(html).toMatch(/<th[^>]*scope="col"[^>]*>[^<]*name/);
    expect(html).toMatch(/<td[^>]*>[^<]*value/);
  });
});
