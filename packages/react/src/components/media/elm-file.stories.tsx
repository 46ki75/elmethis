import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmFile } from "./elm-file";

const file = "https://rust-lang.org/logos/rust-logo-512x512.png";

const meta = {
  title: "Components/Media/elm-file",
  component: ElmFile,
  tags: ["autodocs"],
  args: {
    src: file,
  },
} satisfies Meta<typeof ElmFile>;

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
