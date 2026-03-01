import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ElmFile } from "./elm-file";

import file from "../../assets/vite.svg";

const meta: Meta<typeof ElmFile> = {
  title: "Components/Media/elm-file",
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

export const Secondary: Story = {
  args: {
    src: file,
  },
};
