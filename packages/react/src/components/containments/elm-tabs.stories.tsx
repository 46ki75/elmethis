import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { ElmTab, ElmTabList, ElmTabPanel, ElmTabs } from "./elm-tabs";
import { ElmParagraph } from "../typography/elm-paragraph";

const meta = {
  title: "Components/Containments/elm-tabs",
  component: ElmTabs,
  tags: ["autodocs"],
  args: {},
} satisfies Meta<typeof ElmTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

const SampleTabs = ({ defaultValue = "tab1" }: { defaultValue?: string }) => (
  <ElmTabs defaultValue={defaultValue}>
    <ElmTabList>
      <ElmTab value="tab1">Tab 1</ElmTab>
      <ElmTab value="tab2">Tab 2</ElmTab>
      <ElmTab value="tab3">Tab 3</ElmTab>
      <ElmTab value="more">More</ElmTab>
    </ElmTabList>

    <ElmTabPanel value="tab1">Content 1</ElmTabPanel>
    <ElmTabPanel value="tab2">Content 2</ElmTabPanel>
    <ElmTabPanel value="tab3">
      <ElmParagraph>Content 3-A</ElmParagraph>
      <ElmParagraph>Content 3-B</ElmParagraph>
      <ElmParagraph>Content 3-C</ElmParagraph>
    </ElmTabPanel>
    <ElmTabPanel value="more">More content here.</ElmTabPanel>
  </ElmTabs>
);

// Uncontrolled: the tabs manage the selected value internally.
export const Primary: Story = {
  render: () => <SampleTabs />,
};

export const DefaultSelected: Story = {
  render: () => <SampleTabs defaultValue="tab3" />,
};

// Controlled: parent owns the selected tab value.
const ControlledTabs = () => {
  const [selected, setSelected] = useState("tab1");
  const tabs = ["tab1", "tab2", "tab3", "more"] as const;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
        selected: {selected}
      </div>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        {tabs.map((value) => (
          <button key={value} onClick={() => setSelected(value)}>
            Go to {value}
          </button>
        ))}
      </div>

      <ElmTabs value={selected} onValueChange={setSelected}>
        <ElmTabList>
          <ElmTab value="tab1">Tab 1</ElmTab>
          <ElmTab value="tab2">Tab 2</ElmTab>
          <ElmTab value="tab3">Tab 3</ElmTab>
          <ElmTab value="more">More</ElmTab>
        </ElmTabList>

        <ElmTabPanel value="tab1">Content 1</ElmTabPanel>
        <ElmTabPanel value="tab2">Content 2</ElmTabPanel>
        <ElmTabPanel value="tab3">
          <ElmParagraph>Content 3-A</ElmParagraph>
          <ElmParagraph>Content 3-B</ElmParagraph>
          <ElmParagraph>Content 3-C</ElmParagraph>
        </ElmTabPanel>
        <ElmTabPanel value="more">More content here.</ElmTabPanel>
      </ElmTabs>
    </div>
  );
};

export const Controlled: Story = {
  render: () => <ControlledTabs />,
};

// Many tabs in a narrow (mobile-sized) frame. The tab list scrolls
// horizontally instead of clipping the tabs that overflow the container.
const scrollTabs = [
  { value: "overview", label: "Overview" },
  { value: "metrics", label: "Metrics" },
  { value: "activity", label: "Activity" },
  { value: "settings", label: "Settings" },
  { value: "billing", label: "Billing" },
  { value: "members", label: "Members" },
];

export const Scrollable: Story = {
  render: () => (
    <div style={{ maxWidth: 320, border: "1px dashed gray", padding: 8 }}>
      <ElmTabs defaultValue="overview">
        <ElmTabList>
          {scrollTabs.map((tab) => (
            <ElmTab key={tab.value} value={tab.value}>
              {tab.label}
            </ElmTab>
          ))}
        </ElmTabList>

        {scrollTabs.map((tab) => (
          <ElmTabPanel key={tab.value} value={tab.value}>
            {tab.label} content
          </ElmTabPanel>
        ))}
      </ElmTabs>
    </div>
  ),
};
