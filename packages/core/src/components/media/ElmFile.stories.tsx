import type { Meta, StoryObj } from "@storybook/vue3";
import ElmFile from "./ElmFile.vue";

import file from "../../assets/vite.svg";

const meta: Meta<typeof ElmFile> = {
  title: "Components/Media/ElmFile",
  component: ElmFile,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    src: file,
    filesize: "1.46 KB",
  },
};
