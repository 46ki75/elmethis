import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";

import { ElmMarkdown } from "./elm-markdown";

// ElmMarkdown lexes a markdown string with `marked` and maps each token type
// onto the corresponding elm typography / media / code / table component. The
// tests below are smoke-level breadth: one representative case per major token
// type, asserting the markdown reached the expected element. Shiki-highlighted
// code is async, so the code-block test only asserts the surrounding block /
// caption renders synchronously rather than the highlighted tokens.

const renderHTML = (markdown: string) =>
  mount(ElmMarkdown, { props: { markdown } }).html().toLowerCase();

describe("[CSR] ElmMarkdown — block typography", () => {
  it("headings map to <h1>..<h3> by depth", () => {
    const html = renderHTML("# One\n\n## Two\n\n### Three");
    expect(html).toContain("<h1");
    expect(html).toContain("<h2");
    expect(html).toContain("<h3");
    expect(html).toContain("one");
    expect(html).toContain("three");
  });

  it("a paragraph maps to <p>", () => {
    const html = renderHTML("Just a plain paragraph.");
    expect(html).toContain("<p");
    expect(html).toContain("just a plain paragraph.");
  });

  it("an unordered list maps to <ul> with items", () => {
    const html = renderHTML("- alpha\n- beta\n- gamma");
    expect(html).toContain("<ul");
    expect(html).toContain("alpha");
    expect(html).toContain("gamma");
  });

  it("an ordered list maps to <ol>", () => {
    const html = renderHTML("1. first\n2. second");
    expect(html).toContain("<ol");
    expect(html).toContain("first");
  });

  it("a blockquote renders its inner content", () => {
    const html = renderHTML("> quoted wisdom");
    expect(html).toContain("quoted wisdom");
  });

  it("a horizontal rule maps to a divider <hr>", () => {
    const html = renderHTML("above\n\n---\n\nbelow");
    expect(html).toContain("<hr");
  });
});

describe("[CSR] ElmMarkdown — inline decorations", () => {
  it("bold text renders the literal content", () => {
    expect(renderHTML("**loud**")).toContain("loud");
  });

  it("italic text renders the literal content", () => {
    expect(renderHTML("*soft*")).toContain("soft");
  });

  it("a link maps to an <a> with the href", () => {
    const html = renderHTML("[site](https://example.test/)");
    expect(html).toContain("<a");
    expect(html).toContain("https://example.test/");
    expect(html).toContain("site");
  });

  it("an inline code span renders its text", () => {
    expect(renderHTML("use `npm install` now")).toContain("npm install");
  });
});

describe("[CSR] ElmMarkdown — media & code", () => {
  it("a fenced code block renders the block shell with its language caption", () => {
    // Shiki highlighting is async; assert the synchronous block scaffolding
    // (the <figure> code block + the language caption) rather than the
    // highlighted tokens.
    const html = renderHTML("```javascript\nconsole.log(1)\n```");
    expect(html).toContain("<figure");
    expect(html).toContain("javascript");
  });
});

describe("[CSR] ElmMarkdown — tables", () => {
  it("a GFM table maps to <table> with header and body cells", () => {
    const html = renderHTML("| Name | Age |\n| --- | --- |\n| Ada | 36 |");
    expect(html).toContain("<table");
    expect(html).toContain("<th");
    expect(html).toContain("<td");
    expect(html).toContain("name");
    expect(html).toContain("ada");
  });
});

describe("[CSR] ElmMarkdown — passthrough", () => {
  it("forwards a custom class onto the root", () => {
    const html = mount(ElmMarkdown, {
      props: { markdown: "hi" },
      attrs: { class: "custom-md" },
    })
      .html()
      .toLowerCase();
    expect(html).toContain("custom-md");
  });
});

describe("[SSR] ElmMarkdown", () => {
  it("renders block typography server-side (synchronous lex)", async () => {
    const html = (
      await renderToString(
        createSSRApp({
          render: () =>
            h(ElmMarkdown, { markdown: "# Heading\n\nA paragraph." }),
        }),
      )
    ).toLowerCase();
    expect(html).toContain("<h1");
    expect(html).toContain("heading");
    expect(html).toContain("<p");
    expect(html).toContain("a paragraph.");
  });
});
