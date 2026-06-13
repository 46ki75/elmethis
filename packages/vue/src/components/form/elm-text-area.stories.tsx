import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import { mdiCommentTextOutline } from "@mdi/js";

import { ElmTextArea } from "./elm-text-area";
import { ElmInlineText } from "../typography/elm-inline-text";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";

const meta = {
  title: "Components/Form/elm-text-area",
  component: ElmTextArea,
  tags: ["autodocs"],
  args: {
    label: "Description",
    placeholder: "Tell us what you think...",
    rows: 4,
  },
} satisfies Meta<typeof ElmTextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    label: "Description",
    maxLength: 200,
    placeholder: "Tell us what you think...",
    rows: 4,
    required: false,
  },
  render: (args) => ({
    components: { ElmTextArea, ElmInlineText },
    setup() {
      const text = ref("");
      return { args, text };
    },
    template: `
      <div>
        <ElmTextArea v-bind="args" v-model:value="text" />
        <ElmTextArea v-bind="args" v-model:value="text" />
        <ElmInlineText>{{ text }}</ElmInlineText>
      </div>
    `,
  }),
};

export const WithIcon: Story = {
  render: () => ({
    components: { ElmTextArea, ElmInlineText, ElmMdiIcon },
    setup() {
      const text = ref("");
      return { text, mdiCommentTextOutline };
    },
    template: `
      <div>
        <ElmTextArea label="Comment" placeholder="Leave a comment" v-model:value="text" :rows="5">
          <template #icon><ElmMdiIcon :d="mdiCommentTextOutline" size="0.75rem" color="gray" /></template>
        </ElmTextArea>
        <ElmInlineText>{{ text }}</ElmInlineText>
      </div>
    `,
  }),
};

export const Disabled: Story = {
  render: () => ({
    components: { ElmTextArea },
    template: `
      <ElmTextArea
        label="Description"
        placeholder="Tell us what you think..."
        :default-value="'This field is read-only.\\nYou cannot edit me.'"
        disabled
        :rows="4"
      />
    `,
  }),
};

export const Loading: Story = {
  render: () => ({
    components: { ElmTextArea },
    setup() {
      const text = ref("");
      return { text };
    },
    template: `<ElmTextArea label="Description" placeholder="Tell us what you think..." v-model:value="text" is-loading :rows="4" />`,
  }),
};
