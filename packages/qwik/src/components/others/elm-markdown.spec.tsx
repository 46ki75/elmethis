import { describe, expect, test } from "vitest";
import { createDOM } from "@qwik.dev/core/testing";
import type { JSXOutput } from "@qwik.dev/core";

import { ElmMarkdown } from "./elm-markdown";

// ElmMarkdown lexes a markdown string with `marked` and maps each token type
// onto the corresponding elm typography / media / code / table component. The
// tests below are smoke-level breadth: one representative case per major token
// type, asserting the markdown reached the expected element. Shiki-highlighted
// code is async, so the code-block test only asserts the surrounding block /
// caption renders synchronously rather than the highlighted tokens.

const renderHTML = async (node: JSXOutput) => {
  const { screen, render } = await createDOM();
  await render(node);
  return screen.outerHTML.toLowerCase();
};

describe("[CSR] ElmMarkdown — block typography", () => {
  test("headings map to <h1>..<h3> by depth", async () => {
    const html = await renderHTML(
      <ElmMarkdown markdown={"# One\n\n## Two\n\n### Three"} />,
    );
    expect(html).toContain("<h1");
    expect(html).toContain("<h2");
    expect(html).toContain("<h3");
    expect(html).toContain("one");
    expect(html).toContain("three");
  });

  test("a paragraph maps to <p>", async () => {
    const html = await renderHTML(
      <ElmMarkdown markdown={"Just a plain paragraph."} />,
    );
    expect(html).toContain("<p");
    expect(html).toContain("just a plain paragraph.");
  });

  test("an unordered list maps to <ul> with items", async () => {
    const html = await renderHTML(
      <ElmMarkdown markdown={"- alpha\n- beta\n- gamma"} />,
    );
    expect(html).toContain("<ul");
    expect(html).toContain("alpha");
    expect(html).toContain("gamma");
  });

  test("an ordered list maps to <ol>", async () => {
    const html = await renderHTML(
      <ElmMarkdown markdown={"1. first\n2. second"} />,
    );
    expect(html).toContain("<ol");
    expect(html).toContain("first");
  });

  test("a blockquote renders its inner content", async () => {
    const html = await renderHTML(<ElmMarkdown markdown={"> quoted wisdom"} />);
    expect(html).toContain("quoted wisdom");
  });

  test("a horizontal rule maps to a divider <hr>", async () => {
    const html = await renderHTML(
      <ElmMarkdown markdown={"above\n\n---\n\nbelow"} />,
    );
    expect(html).toContain("<hr");
  });
});

describe("[CSR] ElmMarkdown — inline decorations", () => {
  test("bold text renders the literal content", async () => {
    const html = await renderHTML(<ElmMarkdown markdown={"**loud**"} />);
    expect(html).toContain("loud");
  });

  test("italic text renders the literal content", async () => {
    const html = await renderHTML(<ElmMarkdown markdown={"*soft*"} />);
    expect(html).toContain("soft");
  });

  test("a link maps to an <a> with the href", async () => {
    const html = await renderHTML(
      <ElmMarkdown markdown={"[site](https://example.test/)"} />,
    );
    expect(html).toContain("<a");
    expect(html).toContain("https://example.test/");
    expect(html).toContain("site");
  });

  test("an inline code span renders its text", async () => {
    const html = await renderHTML(
      <ElmMarkdown markdown={"use `npm install` now"} />,
    );
    expect(html).toContain("npm install");
  });
});

describe("[CSR] ElmMarkdown — media & code", () => {
  // NOTE: the image case (`![alt](src)` → ElmBlockImage) is intentionally NOT
  // unit-tested. ElmBlockImage's `useVisibleTask$` calls `imgRef.value.decode()`,
  // which happy-dom's HTMLImageElement doesn't implement — it throws an
  // unhandled rejection that fails the run. That mapping needs the browser
  // layer (real `<img>.decode()`); see TESTING.md's visible-task gotchas.

  test("a fenced code block renders the block shell with its language caption", async () => {
    // Shiki highlighting is async; assert the synchronous block scaffolding
    // (the <figure> code block + the language caption) rather than the
    // highlighted tokens.
    const html = await renderHTML(
      <ElmMarkdown markdown={"```javascript\nconsole.log(1)\n```"} />,
    );
    expect(html).toContain("<figure");
    expect(html).toContain("javascript");
  });
});

describe("[CSR] ElmMarkdown — tables", () => {
  test("a GFM table maps to <table> with header and body cells", async () => {
    const html = await renderHTML(
      <ElmMarkdown markdown={"| Name | Age |\n| --- | --- |\n| Ada | 36 |"} />,
    );
    expect(html).toContain("<table");
    expect(html).toContain("<th");
    expect(html).toContain("<td");
    expect(html).toContain("name");
    expect(html).toContain("ada");
  });
});

describe("[CSR] ElmMarkdown — passthrough", () => {
  test("forwards a custom class onto the root", async () => {
    const html = await renderHTML(
      <ElmMarkdown class="custom-md" markdown={"hi"} />,
    );
    expect(html).toContain("custom-md");
  });
});
