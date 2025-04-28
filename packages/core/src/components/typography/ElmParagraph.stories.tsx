import type { Meta, StoryObj } from "@storybook/vue3";
import ElmParagraph from "./ElmParagraph.vue";
import ElmInlineText from "./ElmInlineText.vue";

const meta: Meta<typeof ElmParagraph> = {
  title: "Components/Typography/ElmParagraph",
  component: ElmParagraph,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  render: () => ({
    components: { ElmParagraph, ElmInlineText },
    template: `
      <ElmParagraph>
        <ElmInlineText text="This is a paragraph with an inline text component." />
      </ElmParagraph>
    `,
  }),
};
