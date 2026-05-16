import { $, component$, useSignal } from "@qwik.dev/core";
import type { Meta, StoryObj } from "storybook-framework-qwik";
import {
  ElmTab,
  ElmTabList,
  ElmTabPanel,
  ElmTabs,
  type ElmTabsProps,
} from "./elm-tabs";
import { ElmInlineText } from "../typography/elm-inline-text";
import { ElmParagraph } from "../typography/elm-paragraph";
import { ElmLanguageIcon } from "../icon/elm-language-icon";
import { ElmCodeBlock } from "../code/elm-code-block";

import code from "../code/seed/main.rs?raw";

const meta: Meta<ElmTabsProps> = {
  title: "Components/Containments/elm-tabs",
  component: ElmTabs,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<ElmTabsProps>;

const SampleTabs = component$<{ defaultValue?: string }>(
  ({ defaultValue = "tab1" }) => (
    <ElmTabs defaultValue={defaultValue}>
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
  ),
);

// Uncontrolled: the tabs manage the selected value internally.
export const Primary: Story = {
  render: () => <SampleTabs />,
};

export const DefaultSelected: Story = {
  render: () => <SampleTabs defaultValue="tab3" />,
};

// Controlled: parent owns the selected tab value.
const ControlledTabs = component$(() => {
  const selected = useSignal("tab1");
  const tabs = ["tab1", "tab2", "tab3", "code"] as const;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
        selected: {selected.value}
      </div>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        {tabs.map((value) => (
          <button key={value} onClick$={() => (selected.value = value)}>
            Go to {value}
          </button>
        ))}
      </div>

      <ElmTabs
        value={selected.value}
        onValueChange$={$((v) => {
          selected.value = v;
        })}
      >
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
            <span
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
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
    </div>
  );
});

export const Controlled: Story = {
  render: () => <ControlledTabs />,
};
