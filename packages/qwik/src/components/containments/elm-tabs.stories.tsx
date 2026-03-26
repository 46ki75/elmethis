import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ElmTabs } from "./elm-tabs";
import { ElmInlineText } from "../typography/elm-inline-text";
import { ElmParagraph } from "../typography/elm-paragraph";
import { ElmLanguageIcon } from "../icon/elm-language-icon";
import { ElmCodeBlock } from "../code/elm-code-block";

import code from "../code/seed/main.rs?raw";

const meta: Meta<typeof ElmTabs> = {
  title: "Components/Containments/elm-tabs",
  component: ElmTabs,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  render() {
    return (
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
      />
    );
  },
};
