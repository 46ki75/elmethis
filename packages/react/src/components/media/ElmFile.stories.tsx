import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmFile } from "./ElmFile";

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
    src: "https://vitejs.dev/logo.svg",
    filesize: "1.46 KB",
  },
};

export const WithName: Story = {
  args: {
    src: "https://vitejs.dev/logo.svg",
    name: "vite-logo.svg",
    filesize: "1.46 KB",
  },
};
