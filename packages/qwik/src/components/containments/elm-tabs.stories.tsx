import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ElmTabs } from "./elm-tabs";
import { $ } from "@builder.io/qwik";
import { ElmInlineText } from "../typography/elm-inline-text";
import { ElmParagraph } from "../typography/elm-paragraph";

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
        renderTabFunctions$={[
          $(() => <ElmInlineText>Tab 1</ElmInlineText>),
          $(() => <ElmInlineText>Tab 2</ElmInlineText>),
          $(() => <ElmInlineText>Tab 3</ElmInlineText>),
        ]}
        renderTabContentFunctions$={[
          $(() => <ElmInlineText>Content 1</ElmInlineText>),
          $(() => <ElmInlineText>Content 2</ElmInlineText>),
          $(() => (
            <div style={{ "--margin-block": "32px" }}>
              <ElmParagraph>Content 3-A</ElmParagraph>
              <ElmParagraph>Content 3-B</ElmParagraph>
              <ElmParagraph>Content 3-C</ElmParagraph>
            </div>
          )),
        ]}
      />
    );
  },
};
