import { $, component$, useSignal } from "@builder.io/qwik";
import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ElmTabs, type ElmTabsProps } from "./elm-tabs";
import { ElmInlineText } from "../typography/elm-inline-text";
import { ElmParagraph } from "../typography/elm-paragraph";
import { ElmLanguageIcon } from "../icon/elm-language-icon";
import { ElmCodeBlock } from "../code/elm-code-block";

import code from "../code/seed/main.rs?raw";

const TAB_LABELS = [
  <ElmInlineText key={1}>Tab 1</ElmInlineText>,
  <ElmInlineText key={2}>Tab 2</ElmInlineText>,
  <ElmInlineText key={3}>Tab 3</ElmInlineText>,
  <span key={4} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
    <ElmLanguageIcon language="rust" size={16} />
    <ElmInlineText>Code</ElmInlineText>
  </span>,
];

const TAB_CONTENTS = [
  <ElmInlineText key={1}>Content 1</ElmInlineText>,
  <ElmInlineText key={2}>Content 2</ElmInlineText>,
  <div key={3} style={{ "--margin-block": "32px" }}>
    <ElmParagraph>Content 3-A</ElmParagraph>
    <ElmParagraph>Content 3-B</ElmParagraph>
    <ElmParagraph>Content 3-C</ElmParagraph>
  </div>,
  <ElmCodeBlock key={4} language="rust" code={code} />,
];

const meta: Meta<ElmTabsProps> = {
  title: "Components/Containments/elm-tabs",
  component: ElmTabs,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<ElmTabsProps>;

// Uncontrolled: the tabs manage the selected index internally.
export const Primary: Story = {
  render() {
    return <ElmTabs tabLabels={TAB_LABELS} tabContents={TAB_CONTENTS} />;
  },
};

export const DefaultSelected: Story = {
  render() {
    return (
      <ElmTabs
        tabLabels={TAB_LABELS}
        tabContents={TAB_CONTENTS}
        defaultSelectedTabIndex={2}
      />
    );
  },
};

// Controlled: parent owns the selected tab index.
const ControlledTabs = component$(() => {
  const selectedTabIndex = useSignal(0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
        selectedTabIndex: {selectedTabIndex.value}
      </div>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        {TAB_LABELS.map((_, i) => (
          <button key={i} onClick$={() => (selectedTabIndex.value = i)}>
            Go to tab {i + 1}
          </button>
        ))}
      </div>

      <ElmTabs
        tabLabels={TAB_LABELS}
        tabContents={TAB_CONTENTS}
        selectedTabIndex={selectedTabIndex.value}
        onSelectedTabIndexChange$={$((i) => {
          selectedTabIndex.value = i;
        })}
      />
    </div>
  );
});

export const Controlled: Story = {
  render: () => <ControlledTabs />,
};
