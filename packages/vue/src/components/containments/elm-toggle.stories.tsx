import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";

import { ElmToggle } from "./elm-toggle";
import { ElmHeading } from "../typography/elm-heading";
import { ElmParagraph } from "../typography/elm-paragraph";
import { ElmInlineText } from "../typography/elm-inline-text";

const meta = {
  title: "Components/Containments/elm-toggle",
  component: ElmToggle,
  tags: ["autodocs"],
  args: {},
  argTypes: {
    monochrome: { control: "boolean" },
  },
} satisfies Meta<typeof ElmToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  render: (args) => ({
    components: { ElmToggle, ElmHeading, ElmParagraph },
    setup() {
      return { args };
    },
    template: `
      <ElmToggle summary="Click me to toggle" v-bind="args">
        <ElmHeading :level="2">Body</ElmHeading>
        <ElmParagraph>
          This is the body of the toggle. You can put any content here, and it
          will be shown or hidden when you click the summary.
        </ElmParagraph>
      </ElmToggle>
    `,
  }),
};

export const CustomSummary: Story = {
  render: (args) => ({
    components: { ElmToggle, ElmHeading, ElmParagraph, ElmInlineText },
    setup() {
      return { args };
    },
    template: `
      <ElmToggle v-bind="args">
        <template #summary><ElmInlineText>Custom summary content</ElmInlineText></template>
        <ElmHeading :level="2">Body</ElmHeading>
        <ElmParagraph>
          This toggle uses a custom summary node instead of the plain string
          summary.
        </ElmParagraph>
      </ElmToggle>
    `,
  }),
};

export const Controlled: Story = {
  render: () => ({
    components: { ElmToggle, ElmHeading, ElmParagraph },
    setup() {
      const isOpen = ref(false);
      return { isOpen };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 1rem">
        <div style="display: flex; align-items: center; gap: 1rem">
          <span style="font-family: monospace">isOpen: {{ isOpen }}</span>
          <button @click="isOpen = !isOpen">Toggle from outside</button>
        </div>
        <ElmToggle summary="Controlled toggle" v-model:is-open="isOpen">
          <ElmHeading :level="2">Body</ElmHeading>
          <ElmParagraph>
            This toggle's open state is controlled by the parent component. You
            can toggle it from outside using the button above.
          </ElmParagraph>
        </ElmToggle>
      </div>
    `,
  }),
};

export const DefaultOpen: Story = {
  render: (args) => ({
    components: { ElmToggle, ElmHeading, ElmParagraph },
    setup() {
      return { args };
    },
    template: `
      <ElmToggle summary="Open by default" default-is-open v-bind="args">
        <ElmHeading :level="2">Body</ElmHeading>
        <ElmParagraph>
          This toggle is open by default via the uncontrolled defaultIsOpen prop.
        </ElmParagraph>
      </ElmToggle>
    `,
  }),
};
