import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ElmCommandPalette from "./ElmCommandPalette.vue";

const meta: Meta<typeof ElmCommandPalette> = {
  title: "Command Palette/ElmCommandPalette",
  component: ElmCommandPalette,
  tags: ["autodocs"],
  args: {
    commands: [
      {
        id: "7e3a53b9-c486-4b67-8216-5686517b99b7",
        label: "GitHub",
        icon: "https://github.githubassets.com/favicons/favicon.svg",
      },
      {
        id: "0e02fda3-0460-4bd5-839f-9f0d251ce83e",
        label: "VueUse",
        icon: "https://vueuse.org/favicon.svg",
      },
      {
        id: "3589e1b1-ddc5-4f7e-97cd-79c1d76df288",
        label: "Feedly",
        icon: "https://feedly.com/feedly-32.png",
      },
    ],
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
