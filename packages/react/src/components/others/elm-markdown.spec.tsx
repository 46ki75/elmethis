import { describe, expect, test } from "vitest";
import { render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";

import { ElmMarkdown } from "./elm-markdown";

// ElmMarkdown lexes a markdown string with `marked` and maps each token type
// onto the corresponding elm typography / media / code / table component. The
// tests below are smoke-level breadth: one representative case per major token
// type, asserting the markdown reached the expected element. Shiki-highlighted
// code is async, so the code-block test only asserts the surrounding block /
// caption renders synchronously rather than the highlighted tokens.

const renderHTML = (markdown: string) =>
  render(<ElmMarkdown markdown={markdown} />).container.innerHTML.toLowerCase();

describe("[CSR] ElmMarkdown — block typography", () => {
  test("headings map to <h1>..<h3> by depth", () => {
    const html = renderHTML("# One\n\n## Two\n\n### Three");
    expect(html).toContain("<h1");
    expect(html).toContain("<h2");
    expect(html).toContain("<h3");
    expect(html).toContain("one");
    expect(html).toContain("three");
  });

  test("a paragraph maps to <p>", () => {
    const html = renderHTML("Just a plain paragraph.");
    expect(html).toContain("<p");
    expect(html).toContain("just a plain paragraph.");
  });

  test("an unordered list maps to <ul> with items", () => {
    const html = renderHTML("- alpha\n- beta\n- gamma");
    expect(html).toContain("<ul");
    expect(html).toContain("alpha");
    expect(html).toContain("gamma");
  });

  test("an ordered list maps to <ol>", () => {
    const html = renderHTML("1. first\n2. second");
    expect(html).toContain("<ol");
    expect(html).toContain("first");
  });

  test("a blockquote renders its inner content", () => {
    const html = renderHTML("> quoted wisdom");
    expect(html).toContain("quoted wisdom");
  });

  test("a horizontal rule maps to a divider <hr>", () => {
    const html = renderHTML("above\n\n---\n\nbelow");
    expect(html).toContain("<hr");
  });
});

describe("[CSR] ElmMarkdown — inline decorations", () => {
  test("bold text renders the literal content", () => {
    expect(renderHTML("**loud**")).toContain("loud");
  });

  test("italic text renders the literal content", () => {
    expect(renderHTML("*soft*")).toContain("soft");
  });

  test("a link maps to an <a> with the href", () => {
    const html = renderHTML("[site](https://example.test/)");
    expect(html).toContain("<a");
    expect(html).toContain("https://example.test/");
    expect(html).toContain("site");
  });

  test("an inline code span renders its text", () => {
    expect(renderHTML("use `npm install` now")).toContain("npm install");
  });
});

describe("[CSR] ElmMarkdown — media & code", () => {
  // NOTE: the image case (`![alt](src)` → ElmBlockImage) is intentionally NOT
  // unit-tested. ElmBlockImage's effect calls `imgRef.current.decode()`, which
  // happy-dom's HTMLImageElement doesn't implement — it throws an unhandled
  // rejection that fails the run. That mapping needs the browser layer (real
  // `<img>.decode()`); see TESTING.md's visible-task gotchas.

  test("a fenced code block renders the block shell with its language caption", () => {
    // Shiki highlighting is async; assert the synchronous block scaffolding
    // (the <figure> code block + the language caption) rather than the
    // highlighted tokens.
    const html = renderHTML("```javascript\nconsole.log(1)\n```");
    expect(html).toContain("<figure");
    expect(html).toContain("javascript");
  });
});

describe("[CSR] ElmMarkdown — tables", () => {
  test("a GFM table maps to <table> with header and body cells", () => {
    const html = renderHTML("| Name | Age |\n| --- | --- |\n| Ada | 36 |");
    expect(html).toContain("<table");
    expect(html).toContain("<th");
    expect(html).toContain("<td");
    expect(html).toContain("name");
    expect(html).toContain("ada");
  });
});

describe("[CSR] ElmMarkdown — passthrough", () => {
  test("forwards a custom class onto the root", () => {
    const { container } = render(
      <ElmMarkdown className="custom-md" markdown="hi" />,
    );
    expect(container.innerHTML.toLowerCase()).toContain("custom-md");
  });
});

describe("[SSR] ElmMarkdown", () => {
  test("renders block typography server-side (synchronous lex)", () => {
    const html = renderToStaticMarkup(
      <ElmMarkdown markdown={"# Heading\n\nA paragraph."} />,
    ).toLowerCase();
    expect(html).toContain("<h1");
    expect(html).toContain("heading");
    expect(html).toContain("<p");
    expect(html).toContain("a paragraph.");
  });
});
