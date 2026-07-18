import type { Meta, StoryObj } from "storybook-solidjs-vite";

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
    filesize: "1.46 KB",
  },
};

export const ExplicitName: Story = {
  args: {
    name: "rust-logo.png",
  },
};
