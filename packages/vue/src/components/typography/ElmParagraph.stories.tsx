import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ElmParagraph from "./ElmParagraph.vue";
import ElmInlineText from "./ElmInlineText.vue";

const meta: Meta<typeof ElmParagraph> = {
  title: "Components/Typography/ElmParagraph",
  component: ElmParagraph,
  tags: ["autodocs"],
  args: {},
  render: (args) => ({
    components: { ElmParagraph, ElmInlineText },
    setup() {
      return { args };
    },
    template: `
      <ElmParagraph v-bind="args">
        <ElmInlineText text="This is a paragraph with an inline text component." />
      </ElmParagraph>
    `,
  }),
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Color: Story = {
  args: {
    color: "#4b9ba9",
  },
};

export const BackgroundColor: Story = {
  args: {
    backgroundColor: "#b1d6dc",
  },
};
