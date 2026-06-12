import { describe, expect, test } from "vitest";
import { render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import type { Component } from "jarkup-ts";

import { ElmJarkup } from "./elm-jarkup";

// ElmJarkup walks a Jarkup AST (`Component[]`) and maps each node `type` onto
// the matching elm component. Smoke-level breadth: a single representative
// AST covering a few node types (heading, paragraph with inline decoration,
// list, callout, divider, table) renders to the expected elements. The
// unsupported-node fallback is covered separately since it is the safety net
// for unknown agent output.

const renderHTML = (components: Component[]) =>
  render(
    <ElmJarkup jsonComponents={components} />,
  ).container.innerHTML.toLowerCase();

describe("[CSR] ElmJarkup — representative AST", () => {
  test("renders heading / paragraph / list / divider node types", () => {
    const ast: Component[] = [
      {
        type: "Heading",
        props: { level: 2 },
        slots: { default: [{ type: "Text", props: { text: "Title" } }] },
      },
      {
        type: "Paragraph",
        slots: {
          default: [
            { type: "Text", props: { text: "plain " } },
            { type: "Text", props: { text: "bold", bold: true } },
          ],
        },
      },
      {
        type: "List",
        props: { listStyle: "unordered" },
        slots: {
          default: [
            {
              type: "ListItem",
              slots: { default: [{ type: "Text", props: { text: "one" } }] },
            },
            {
              type: "ListItem",
              slots: { default: [{ type: "Text", props: { text: "two" } }] },
            },
          ],
        },
      },
      { type: "Divider" },
    ] as Component[];

    const html = renderHTML(ast);
    expect(html).toContain("<h2");
    expect(html).toContain("title");
    expect(html).toContain("<p");
    expect(html).toContain("bold");
    expect(html).toContain("<ul");
    expect(html).toContain("one");
    expect(html).toContain("two");
    expect(html).toContain("<hr");
  });

  test("ordered list maps to <ol>", () => {
    const html = renderHTML([
      {
        type: "List",
        props: { listStyle: "ordered" },
        slots: {
          default: [
            {
              type: "ListItem",
              slots: { default: [{ type: "Text", props: { text: "first" } }] },
            },
          ],
        },
      },
    ] as Component[]);
    expect(html).toContain("<ol");
    expect(html).toContain("first");
  });

  test("a Table maps to <table> with header and body cells", () => {
    const html = renderHTML([
      {
        type: "Table",
        slots: {
          header: [
            {
              type: "TableRow",
              slots: {
                default: [
                  {
                    type: "TableCell",
                    slots: {
                      default: [{ type: "Text", props: { text: "Name" } }],
                    },
                  },
                ],
              },
            },
          ],
          body: [
            {
              type: "TableRow",
              slots: {
                default: [
                  {
                    type: "TableCell",
                    slots: {
                      default: [{ type: "Text", props: { text: "Ada" } }],
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    ] as Component[]);
    expect(html).toContain("<table");
    expect(html).toContain("<th");
    expect(html).toContain("<td");
    expect(html).toContain("name");
    expect(html).toContain("ada");
  });

  test("a Callout renders its inner content", () => {
    const html = renderHTML([
      {
        type: "Callout",
        props: { type: "tip" },
        slots: {
          default: [
            {
              type: "Paragraph",
              slots: {
                default: [{ type: "Text", props: { text: "heads up" } }],
              },
            },
          ],
        },
      },
    ] as Component[]);
    expect(html).toContain("heads up");
  });
});

describe("[CSR] ElmJarkup — unsupported-node fallback", () => {
  test("an unknown node type renders the unsupported-block by default", () => {
    const html = renderHTML([
      // A type the renderer's switch doesn't handle falls through to the
      // default branch and surfaces an unsupported-block with the type name.
      { type: "TotallyMadeUp" } as unknown as Component,
    ]);
    expect(html).toContain("unsupported component type: totallymadeup");
  });

  test("skipUnsupportedComponentWarning suppresses the fallback entirely", () => {
    const { container } = render(
      <ElmJarkup
        skipUnsupportedComponentWarning
        jsonComponents={[{ type: "TotallyMadeUp" } as unknown as Component]}
      />,
    );
    expect(container.innerHTML.toLowerCase()).not.toContain("unsupported");
  });
});

describe("[SSR] ElmJarkup", () => {
  test("renders the representative AST server-side", () => {
    const html = renderToStaticMarkup(
      <ElmJarkup
        jsonComponents={
          [
            {
              type: "Heading",
              props: { level: 2 },
              slots: { default: [{ type: "Text", props: { text: "Title" } }] },
            },
            { type: "Divider" },
          ] as Component[]
        }
      />,
    ).toLowerCase();
    expect(html).toContain("<h2");
    expect(html).toContain("title");
    expect(html).toContain("<hr");
  });
});
