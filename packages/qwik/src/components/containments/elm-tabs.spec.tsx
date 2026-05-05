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
        tabs={[
          {
            label: <ElmInlineText>Tab 1</ElmInlineText>,
            content: <ElmInlineText>Content 1</ElmInlineText>,
          },
          {
            label: <ElmInlineText>Tab 2</ElmInlineText>,
            content: <ElmInlineText>Content 2</ElmInlineText>,
          },
          {
            label: <ElmInlineText>Tab 3</ElmInlineText>,
            content: (
              <div style={{ "--margin-block": "32px" }}>
                <ElmParagraph>Content 3-A</ElmParagraph>
                <ElmParagraph>Content 3-B</ElmParagraph>
                <ElmParagraph>Content 3-C</ElmParagraph>
              </div>
            ),
          },
          {
            label: (
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ElmLanguageIcon language="rust" size={16} />
                <ElmInlineText>Code</ElmInlineText>
              </span>
            ),
            content: <ElmCodeBlock language="rust" code={code} />,
          },
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
        tabs={[
          {
            label: <ElmInlineText>Tab 1</ElmInlineText>,
            content: <ElmInlineText>Content 1</ElmInlineText>,
          },
          {
            label: <ElmInlineText>Tab 2</ElmInlineText>,
            content: <ElmInlineText>Content 2</ElmInlineText>,
          },
          {
            label: <ElmInlineText>Tab 3</ElmInlineText>,
            content: (
              <div style={{ "--margin-block": "32px" }}>
                <ElmParagraph>Content 3-A</ElmParagraph>
                <ElmParagraph>Content 3-B</ElmParagraph>
                <ElmParagraph>Content 3-C</ElmParagraph>
              </div>
            ),
          },
          {
            label: (
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ElmLanguageIcon language="rust" size={16} />
                <ElmInlineText>Code</ElmInlineText>
              </span>
            ),
            content: <ElmCodeBlock language="rust" code={code} />,
          },
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
