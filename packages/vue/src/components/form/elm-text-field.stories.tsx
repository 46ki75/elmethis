import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import { mdiEmail } from "@mdi/js";

import { ElmTextField } from "./elm-text-field";
import { ElmInlineText } from "../typography/elm-inline-text";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";

const meta = {
  title: "Components/Form/elm-text-field",
  component: ElmTextField,
  tags: ["autodocs"],
  args: {
    label: "Email",
    maxLength: 20,
    suffix: "@46ki75.com",
    placeholder: "Enter your email",
  },
} satisfies Meta<typeof ElmTextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    label: "Email",
    maxLength: 20,
    prefix: "user",
    suffix: "@ikuma.cloud",
    placeholder: "Enter your email",
    required: false,
  },
  render: (args) => ({
    components: { ElmTextField, ElmInlineText },
    setup() {
      const text = ref("");
      return { args, text };
    },
    template: `
      <div>
        <ElmTextField v-bind="args" v-model:value="text" />
        <ElmTextField v-bind="args" v-model:value="text" />
        <ElmInlineText>{{ text }}</ElmInlineText>
      </div>
    `,
  }),
};

export const WithIcon: Story = {
  render: () => ({
    components: { ElmTextField, ElmInlineText, ElmMdiIcon },
    setup() {
      const text = ref("");
      return { text, mdiEmail };
    },
    template: `
      <div>
        <ElmTextField label="Email" placeholder="Enter your email" v-model:value="text">
          <template #icon><ElmMdiIcon :d="mdiEmail" size=".75rem" color="gray" /></template>
        </ElmTextField>
        <ElmInlineText>{{ text }}</ElmInlineText>
      </div>
    `,
  }),
};

export const Password: Story = {
  render: () => ({
    components: { ElmTextField },
    setup() {
      const text = ref("");
      return { text };
    },
    template: `<ElmTextField label="Password" placeholder="Enter your password" is-password v-model:value="text" />`,
  }),
};

export const Disabled: Story = {
  render: () => ({
    components: { ElmTextField },
    setup() {
      const text = ref("example@46ki75.com");
      return { text };
    },
    template: `<ElmTextField label="Email" placeholder="Enter your email" v-model:value="text" disabled />`,
  }),
};

export const Loading: Story = {
  render: () => ({
    components: { ElmTextField },
    setup() {
      const text = ref("");
      return { text };
    },
    template: `<ElmTextField label="Email" placeholder="Enter your email" v-model:value="text" is-loading />`,
  }),
};
