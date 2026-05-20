import { describe, expect, test } from "vitest";
import { createDOM } from "@qwik.dev/core/testing";
import type { JSXOutput } from "@qwik.dev/core";

import { ElmTable } from "./elm-table";
import { ElmTableHeader } from "./elm-table-header";
import { ElmTableBody } from "./elm-table-body";
import { ElmTableRow } from "./elm-table-row";
import { ElmTableCell } from "./elm-table-cell";

// Render a JSX tree and return the rendered HTML, lowercased so callers can
// match `<th>` / `<td>` / attribute names without worrying about happy-dom's
// casing.
const renderHTML = async (node: JSXOutput) => {
  const { screen, render } = await createDOM();
  await render(node);
  return screen.outerHTML.toLowerCase();
};

describe("ElmTable — header section", () => {
  test("cells inside <ElmTableHeader> become <th scope='col'>", async () => {
    const html = await renderHTML(
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

  test("cells inside <ElmTableBody> stay <td>", async () => {
    const html = await renderHTML(
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

describe("ElmTable — row-header promotion (hasRowHeader + columnIndex)", () => {
  test("columnIndex=0 in a hasRowHeader table becomes <th scope='row'>", async () => {
    const html = await renderHTML(
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

  test("columnIndex>0 stays <td> even when hasRowHeader is on", async () => {
    const html = await renderHTML(
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

  test("columnIndex=0 without hasRowHeader stays <td>", async () => {
    const html = await renderHTML(
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

describe("ElmTable — explicit overrides", () => {
  test("isHeader=true in body renders <th> without auto scope", async () => {
    const html = await renderHTML(
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

  test("scope prop overrides the auto-derived scope", async () => {
    const html = await renderHTML(
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

  test("PropsOf<'td'> attrs (colSpan) flow through to <th>", async () => {
    const html = await renderHTML(
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
// section providers should still render without throwing the Qwik Q8
// "context not found" error — the cell falls back to a non-reactive default.
describe("ElmTableCell — no table ancestor", () => {
  test("renders <td> when not under any provider", async () => {
    const html = await renderHTML(<ElmTableCell text="plain" />);
    expect(html).toContain("<td");
    expect(html).not.toContain("<th");
    expect(html).toContain("plain");
  });

  test("text prop takes precedence over slot children", async () => {
    const html = await renderHTML(
      <ElmTableCell text="from-prop">should-not-show</ElmTableCell>,
    );
    expect(html).toContain("from-prop");
    expect(html).not.toContain("should-not-show");
  });

  test("renders slot children when text is absent", async () => {
    const html = await renderHTML(
      <ElmTableCell>
        <span>slot-content</span>
      </ElmTableCell>,
    );
    expect(html).toContain("slot-content");
  });
});
