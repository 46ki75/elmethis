import { createDOM } from "@builder.io/qwik/testing";
import { describe, expect, test } from "vitest";

import { ElmTabs } from "./elm-tabs";
import { ElmInlineText } from "../typography/elm-inline-text";
import { ElmLanguageIcon } from "../icon/elm-language-icon";
import { ElmParagraph } from "../typography/elm-paragraph";
import { ElmCodeBlock } from "../code/elm-code-block";

import code from "../code/seed/main.rs?raw";
import { renderToString } from "@builder.io/qwik/server";

describe("[CSR]", () => {
  test("should render", async () => {
    const { screen, render } = await createDOM();
    await render(
      <ElmTabs
        tabLabels={[
          <ElmInlineText key={1}>Tab 1</ElmInlineText>,
          <ElmInlineText key={2}>Tab 2</ElmInlineText>,
          <ElmInlineText key={3}>Tab 3</ElmInlineText>,
          <span
            key={4}
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <ElmLanguageIcon language="rust" size={16} />
            <ElmInlineText>Code</ElmInlineText>
          </span>,
        ]}
        tabContents={[
          <ElmInlineText key={1}>Content 1</ElmInlineText>,
          <ElmInlineText key={2}>Content 2</ElmInlineText>,
          <div key={3} style={{ "--margin-block": "32px" }}>
            <ElmParagraph>Content 3-A</ElmParagraph>
            <ElmParagraph>Content 3-B</ElmParagraph>
            <ElmParagraph>Content 3-C</ElmParagraph>
          </div>,
          <ElmCodeBlock key={4} language="rust" code={code} />,
        ]}
      />,
    );
    expect(screen.outerHTML).toContain("Tab 1");
    expect(screen.outerHTML).toContain("Tab 2");
    expect(screen.outerHTML).toContain("Tab 3");
    expect(screen.outerHTML).toContain("Code");
    expect(screen.outerHTML).toContain("Content 1");
    expect(screen.outerHTML).toContain("Content 2");
    expect(screen.outerHTML).toContain("Content 3-A");
    expect(screen.outerHTML).toContain("Content 3-B");
    expect(screen.outerHTML).toContain("Content 3-C");
  });
});

describe("[SSR]", () => {
  test("should render", async () => {
    const renderResult = await renderToString(
      <ElmTabs
        tabLabels={[
          <ElmInlineText key={1}>Tab 1</ElmInlineText>,
          <ElmInlineText key={2}>Tab 2</ElmInlineText>,
          <ElmInlineText key={3}>Tab 3</ElmInlineText>,
          <span
            key={4}
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <ElmLanguageIcon language="rust" size={16} />
            <ElmInlineText>Code</ElmInlineText>
          </span>,
        ]}
        tabContents={[
          <ElmInlineText key={1}>Content 1</ElmInlineText>,
          <ElmInlineText key={2}>Content 2</ElmInlineText>,
          <div key={3} style={{ "--margin-block": "32px" }}>
            <ElmParagraph>Content 3-A</ElmParagraph>
            <ElmParagraph>Content 3-B</ElmParagraph>
            <ElmParagraph>Content 3-C</ElmParagraph>
          </div>,
          <ElmCodeBlock key={4} language="rust" code={code} />,
        ]}
      />,
      {
        containerTagName: "div",
        symbolMapper: (symbolName, _mapper, parent) => [symbolName, parent ?? symbolName],
      },
    );
    expect(renderResult.html).toContain("Tab 1");
    expect(renderResult.html).toContain("Tab 2");
    expect(renderResult.html).toContain("Tab 3");
    expect(renderResult.html).toContain("Code");
    expect(renderResult.html).toContain("Content 1");
    expect(renderResult.html).toContain("Content 2");
    expect(renderResult.html).toContain("Content 3-A");
    expect(renderResult.html).toContain("Content 3-B");
    expect(renderResult.html).toContain("Content 3-C");
  });
});
