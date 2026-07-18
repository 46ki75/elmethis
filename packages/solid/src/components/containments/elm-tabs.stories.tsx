import { createSignal, For } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";

import { ElmParagraph } from "../typography/elm-paragraph";
import { ElmTab, ElmTabList, ElmTabPanel, ElmTabs } from "./elm-tabs";

const meta = {
  title: "Components/Containments/elm-tabs",
  component: ElmTabs,
  tags: ["autodocs"],
  args: {},
} satisfies Meta<typeof ElmTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

const SampleTabs = (props: { defaultValue?: string }) => (
  <ElmTabs defaultValue={props.defaultValue ?? "tab1"}>
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

export const Primary: Story = {
  render: () => <SampleTabs />,
};

export const DefaultSelected: Story = {
  render: () => <SampleTabs defaultValue="tab3" />,
};

const ControlledTabs = () => {
  const [selected, setSelected] = createSignal("tab1");
  const tabs = ["tab1", "tab2", "tab3", "more"] as const;

  return (
    <div style={{ display: "flex", "flex-direction": "column", gap: "1rem" }}>
      <div style={{ "font-family": "monospace", "font-size": "0.85rem" }}>
        selected: {selected()}
      </div>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <For each={tabs}>
          {(value) => (
            <button onClick={() => setSelected(value)}>Go to {value}</button>
          )}
        </For>
      </div>

      <ElmTabs value={selected()} onValueChange={setSelected}>
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
    <div
      style={{
        "max-width": "320px",
        border: "1px dashed gray",
        padding: "8px",
      }}
    >
      <ElmTabs defaultValue="overview">
        <ElmTabList>
          <For each={scrollTabs}>
            {(tab) => <ElmTab value={tab.value}>{tab.label}</ElmTab>}
          </For>
        </ElmTabList>

        <For each={scrollTabs}>
          {(tab) => (
            <ElmTabPanel value={tab.value}>{tab.label} content</ElmTabPanel>
          )}
        </For>
      </ElmTabs>
    </div>
  ),
};
