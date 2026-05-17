import { createDOM } from "@qwik.dev/core/testing";
import { describe, expect, test } from "vitest";

import { ElmTab, ElmTabList, ElmTabPanel, ElmTabs } from "./elm-tabs";
import { ElmInlineText } from "../typography/elm-inline-text";
import { ElmLanguageIcon } from "../icon/elm-language-icon";
import { ElmParagraph } from "../typography/elm-paragraph";
import { ElmCodeBlock } from "../code/elm-code-block";

import code from "../code/seed/main.rs?raw";
import { renderToString } from "@qwik.dev/core/server";

const sampleTabs = () => (
  <ElmTabs defaultValue="tab1">
    <ElmTabList>
      <ElmTab value="tab1">
        <ElmInlineText>Tab 1</ElmInlineText>
      </ElmTab>
      <ElmTab value="tab2">
        <ElmInlineText>Tab 2</ElmInlineText>
      </ElmTab>
      <ElmTab value="tab3">
        <ElmInlineText>Tab 3</ElmInlineText>
      </ElmTab>
      <ElmTab value="code">
        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <ElmLanguageIcon language="rust" size={16} />
          <ElmInlineText>Code</ElmInlineText>
        </span>
      </ElmTab>
    </ElmTabList>

    <ElmTabPanel value="tab1">
      <ElmInlineText>Content 1</ElmInlineText>
    </ElmTabPanel>
    <ElmTabPanel value="tab2">
      <ElmInlineText>Content 2</ElmInlineText>
    </ElmTabPanel>
    <ElmTabPanel value="tab3">
      <div style={{ "--margin-block": "32px" }}>
        <ElmParagraph>Content 3-A</ElmParagraph>
        <ElmParagraph>Content 3-B</ElmParagraph>
        <ElmParagraph>Content 3-C</ElmParagraph>
      </div>
    </ElmTabPanel>
    <ElmTabPanel value="code">
      <ElmCodeBlock language="rust" code={code} />
    </ElmTabPanel>
  </ElmTabs>
);

describe("[CSR]", () => {
  test("should render", async () => {
    const { screen, render } = await createDOM();
    await render(sampleTabs());
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
    const renderResult = await renderToString(sampleTabs(), {
      containerTagName: "div",
      symbolMapper: (symbolName, _mapper, parent) => [
        symbolName,
        parent ?? symbolName,
      ],
    });
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
