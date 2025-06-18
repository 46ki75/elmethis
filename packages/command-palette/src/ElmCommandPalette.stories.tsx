import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ElmCommandPalette from "./ElmCommandPalette.vue";

const greet = () => {
  alert("Hi!");
};

const open = (url: string) => () => {
  window.open(url, "_blank", "noopener,noreferrer");
};

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
        invokeCommand: open("https://github.com"),
      },
      {
        id: "0e02fda3-0460-4bd5-839f-9f0d251ce83e",
        label: "VueUse",
        icon: "https://vueuse.org/favicon.svg",
        invokeCommand: greet,
      },
      {
        id: "3589e1b1-ddc5-4f7e-97cd-79c1d76df288",
        label: "Feedly",
        icon: "https://feedly.com/feedly-32.png",
        invokeCommand: greet,
      },
      {
        id: "2209085f-9e63-49bc-abd5-8659c7261814",
        label: "GitLab",
        icon: "https://about.gitlab.com/images/ico/favicon.ico",
        invokeCommand: open("https://about.gitlab.com/"),
      },
    ],
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
