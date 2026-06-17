import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";

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

const sampleTemplate = (defaultValue: string) => ({
  components: { ElmTabs, ElmTabList, ElmTab, ElmTabPanel, ElmParagraph },
  setup() {
    return { defaultValue };
  },
  template: `
    <ElmTabs :default-value="defaultValue">
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
  `,
});

export const Primary: Story = {
  render: () => sampleTemplate("tab1"),
};

export const DefaultSelected: Story = {
  render: () => sampleTemplate("tab3"),
};

// Many tabs in a narrow (mobile-sized) frame. The tab list scrolls
// horizontally instead of clipping the tabs that overflow the container.
export const Scrollable: Story = {
  render: () => ({
    components: { ElmTabs, ElmTabList, ElmTab, ElmTabPanel },
    setup() {
      const tabs = [
        { value: "overview", label: "Overview" },
        { value: "metrics", label: "Metrics" },
        { value: "activity", label: "Activity" },
        { value: "settings", label: "Settings" },
        { value: "billing", label: "Billing" },
        { value: "members", label: "Members" },
      ];
      return { tabs };
    },
    template: `
      <div style="max-width: 320px; border: 1px dashed gray; padding: 8px">
        <ElmTabs default-value="overview">
          <ElmTabList>
            <ElmTab v-for="t in tabs" :key="t.value" :value="t.value">{{ t.label }}</ElmTab>
          </ElmTabList>
          <ElmTabPanel v-for="t in tabs" :key="t.value" :value="t.value">{{ t.label }} content</ElmTabPanel>
        </ElmTabs>
      </div>
    `,
  }),
};

export const Controlled: Story = {
  render: () => ({
    components: { ElmTabs, ElmTabList, ElmTab, ElmTabPanel, ElmParagraph },
    setup() {
      const selected = ref("tab1");
      const tabs = ["tab1", "tab2", "tab3", "more"];
      return { selected, tabs };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 1rem">
        <div style="font-family: monospace; font-size: 0.85rem">
          selected: {{ selected }}
        </div>
        <div style="display: flex; gap: 0.5rem">
          <button v-for="value in tabs" :key="value" @click="selected = value">
            Go to {{ value }}
          </button>
        </div>

        <ElmTabs v-model:value="selected">
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
    `,
  }),
};
