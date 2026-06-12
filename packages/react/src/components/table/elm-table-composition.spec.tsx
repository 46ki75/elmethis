import { describe, expect, test } from "vitest";
import { render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import type { ReactElement } from "react";

import { ElmTable } from "./elm-table";
import { ElmTableHeader } from "./elm-table-header";
import { ElmTableBody } from "./elm-table-body";
import { ElmTableRow } from "./elm-table-row";
import { ElmTableCell } from "./elm-table-cell";

// Render a JSX tree (CSR) and return its HTML, lowercased so callers can match
// `<thead>` / `<th>` / attribute names without fighting casing.
const renderCSR = (node: ReactElement) => {
  const { container } = render(node);
  return container.innerHTML.toLowerCase();
};

// Render a JSX tree (SSR) via renderToStaticMarkup and return its HTML,
// lowercased.
const renderSSR = (node: ReactElement) =>
  renderToStaticMarkup(node).toLowerCase();

// A small but complete table reused across CSR + SSR so both layers assert the
// same composition (caption + thead/tbody + rows + header/data cells).
const sampleTable = (props: { hasRowHeader?: boolean } = {}) => (
  <ElmTable caption="Quarterly Revenue" hasRowHeader={props.hasRowHeader}>
    <ElmTableHeader>
      <ElmTableRow>
        <ElmTableCell columnIndex={0} text="Month" />
        <ElmTableCell columnIndex={1} text="Revenue" />
      </ElmTableRow>
    </ElmTableHeader>
    <ElmTableBody>
      <ElmTableRow>
        <ElmTableCell columnIndex={0} text="January" />
        <ElmTableCell columnIndex={1} text="10000" />
      </ElmTableRow>
      <ElmTableRow>
        <ElmTableCell columnIndex={0} text="February" />
        <ElmTableCell columnIndex={1} text="20000" />
      </ElmTableRow>
    </ElmTableBody>
  </ElmTable>
);

describe("ElmTable — full composition [CSR]", () => {
  test("renders the table shell with caption and both sections", () => {
    const html = renderCSR(sampleTable());
    expect(html).toContain("<table");
    expect(html).toContain("<caption");
    expect(html).toContain("quarterly revenue");
    // Section elements are emitted by their respective sub-components.
    expect(html).toContain("<thead");
    expect(html).toContain("<tbody");
    expect(html).toContain("<tr");
  });

  test("header cells become <th scope='col'>, body cells stay <td>", () => {
    const html = renderCSR(sampleTable());
    // Header row: both cells are column headers.
    expect(html).toMatch(/<th[^>]*scope="col"[^>]*>[^<]*month/);
    expect(html).toMatch(/<th[^>]*scope="col"[^>]*>[^<]*revenue/);
    // Body data cells stay <td> (no row header in this variant).
    expect(html).toMatch(/<td[^>]*>[^<]*january/);
    expect(html).toMatch(/<td[^>]*>[^<]*10000/);
  });

  test("hasRowHeader promotes only the first body column to <th scope='row'>", () => {
    const html = renderCSR(sampleTable({ hasRowHeader: true }));
    // First body column self-promotes to a row header...
    expect(html).toMatch(/<th[^>]*scope="row"[^>]*>[^<]*january/);
    expect(html).toMatch(/<th[^>]*scope="row"[^>]*>[^<]*february/);
    // ...while the second column stays a data cell.
    expect(html).toMatch(/<td[^>]*>[^<]*10000/);
    expect(html).toMatch(/<td[^>]*>[^<]*20000/);
  });
});

describe("ElmTable — full composition [SSR]", () => {
  test("server HTML carries caption, sections and column headers", () => {
    const html = renderSSR(sampleTable());
    expect(html).toContain("<table");
    expect(html).toContain("<caption");
    expect(html).toContain("quarterly revenue");
    expect(html).toContain("<thead");
    expect(html).toContain("<tbody");
    expect(html).toMatch(/<th[^>]*scope="col"[^>]*>[^<]*month/);
    expect(html).toMatch(/<td[^>]*>[^<]*january/);
  });

  test("hasRowHeader row-header promotion survives SSR", () => {
    const html = renderSSR(sampleTable({ hasRowHeader: true }));
    expect(html).toMatch(/<th[^>]*scope="row"[^>]*>[^<]*january/);
    expect(html).toMatch(/<td[^>]*>[^<]*10000/);
  });
});

// The `caption` prop is optional; when omitted the <caption> wrapper must not
// be emitted at all (the source guards it behind `caption && ...`).
describe("ElmTable — caption [CSR]", () => {
  test("omits <caption> when no caption prop is given", () => {
    const html = renderCSR(
      <ElmTable>
        <ElmTableBody>
          <ElmTableRow>
            <ElmTableCell text="x" />
          </ElmTableRow>
        </ElmTableBody>
      </ElmTable>,
    );
    expect(html).toContain("<table");
    expect(html).not.toContain("<caption");
  });
});

// Native attribute / class / style passthrough: props spread onto the
// underlying element on every level of the composition.
describe("ElmTable — native passthrough [CSR]", () => {
  test("className and arbitrary table attrs reach the <table>", () => {
    const html = renderCSR(
      <ElmTable className="my-table" id="revenue" aria-label="Revenue">
        <ElmTableBody>
          <ElmTableRow>
            <ElmTableCell text="x" />
          </ElmTableRow>
        </ElmTableBody>
      </ElmTable>,
    );
    expect(html).toContain("my-table");
    expect(html).toContain('id="revenue"');
    expect(html).toContain('aria-label="revenue"');
  });

  test("className reaches <thead>, <tbody> and <tr>", () => {
    const html = renderCSR(
      <ElmTable>
        <ElmTableHeader className="head-cls">
          <ElmTableRow className="hrow-cls">
            <ElmTableCell text="h" />
          </ElmTableRow>
        </ElmTableHeader>
        <ElmTableBody className="body-cls">
          <ElmTableRow className="brow-cls">
            <ElmTableCell text="b" />
          </ElmTableRow>
        </ElmTableBody>
      </ElmTable>,
    );
    expect(html).toContain("head-cls");
    expect(html).toContain("body-cls");
    expect(html).toContain("hrow-cls");
    expect(html).toContain("brow-cls");
  });

  test("style on a cell flows onto the rendered <td>", () => {
    const html = renderCSR(
      <ElmTable>
        <ElmTableBody>
          <ElmTableRow>
            <ElmTableCell text="styled" style={{ color: "red" }} />
          </ElmTableRow>
        </ElmTableBody>
      </ElmTable>,
    );
    // happy-dom CSR serializes inline styles as `color: red;`; SSR emits
    // `color:red`. Match either spacing.
    expect(html).toMatch(/color:\s*red/);
  });
});

// columnIndex=0 alone (no hasRowHeader) is inert; isHeader should win and
// produce a <th> even at columnIndex 0 inside the body.
describe("ElmTableCell — header derivation edge cases [CSR]", () => {
  test("isHeader at columnIndex 0 renders <th> without scope='row'", () => {
    const html = renderCSR(
      <ElmTable hasRowHeader>
        <ElmTableBody>
          <ElmTableRow>
            <ElmTableCell isHeader columnIndex={0} text="group" />
          </ElmTableRow>
        </ElmTableBody>
      </ElmTable>,
    );
    expect(html).toMatch(/<th[^>]*>[^<]*group/);
    // isHeader short-circuits the row-header path, so no auto scope is set.
    expect(html).not.toContain('scope="row"');
    expect(html).not.toContain('scope="col"');
  });
});
